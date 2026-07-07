import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateReceiptLinkDto } from './dto/create-receipt-link.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { SendReceiptDto } from './dto/send-receipt.dto';
import { SendSaleReceiptDto } from './dto/send-sale-receipt.dto';
import { SendServiceOrderDto } from './dto/send-service-order.dto';
import { notificationTemplate } from './templates/notification.template';
import { serviceOrderTemplate } from './templates/service-order.template';
import { SendTemplateMessageDto } from './dto/send-template-message.dto';
import { TestTemplateDto } from './dto/test-template.dto';
import { TestApprovedTemplateDto } from './dto/test-approved-template.dto';
import { WhatsappResponse } from './interfaces/whatsapp-response.interface';
import { WhatsappCloudProvider } from './providers/whatsapp-cloud.provider';
import { WhatsappMockProvider } from './providers/whatsapp-mock.provider';
import { SalesService } from '../sales/sales.service';
import { buildWhatsAppReceiptUrl, normalizePhoneForWhatsApp } from './utils/whatsapp-link.util';

type WhatsappSendStrategy = 'template_test' | 'receipt_template' | 'receipt_pdf' | 'text' | 'document';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cloud: WhatsappCloudProvider,
    private readonly mock: WhatsappMockProvider,
    private readonly salesService: SalesService,
  ) {}

  sendMessage(dto: SendMessageDto, user: AuthenticatedUser) {
    return this.mockSend(dto.phone, dto.message, user.id, dto.relatedModule, dto.relatedId);
  }

  async testText(dto: SendMessageDto, user: AuthenticatedUser) {
    const result = await this.sendAndLog(
      dto.phone,
      dto.message,
      user.id,
      'whatsapp',
      'test-text',
      undefined,
      'TEST_TEXT',
    );

    return {
      success: result.status === 'SENT' && (result.mode === 'MOCK' || Boolean(result.providerMessageId)),
      message: result.status === 'SENT'
        ? result.mode === 'MOCK'
          ? 'Modo prueba activo: texto simulado correctamente.'
          : 'Texto enviado por WhatsApp correctamente.'
        : 'No se pudo enviar el texto por WhatsApp.',
      data: {
        phone: result.phone,
        mode: result.mode,
        status: result.status,
        providerMessageId: result.providerMessageId,
        errorMessage: result.errorMessage,
      },
      error: result.status === 'ERROR' ? result.errorMessage : undefined,
    };
  }

  async testTemplate(dto: TestTemplateDto, user: AuthenticatedUser) {
    const templateName = this.config.get<string>('WHATSAPP_TEMPLATE_TEST_NAME')?.trim() || 'hello_world';
    const languageCode = this.config.get<string>('WHATSAPP_TEMPLATE_TEST_LANGUAGE')?.trim() || 'en_US';
    const result = await this.sendAndLog(
      dto.phone,
      `Plantilla de prueba Meta: ${templateName}`,
      user.id,
      'whatsapp',
      'test-template',
      templateName,
      'TEST_TEMPLATE',
      undefined,
      { templateName, languageCode },
    );
    const success = result.status === 'SENT' && (result.mode === 'MOCK' || Boolean(result.providerMessageId));

    return {
      success,
      message: success
        ? result.mode === 'MOCK'
          ? 'Modo prueba activo: plantilla simulada correctamente.'
          : 'Plantilla de prueba enviada por WhatsApp correctamente.'
        : 'No se pudo enviar la plantilla de prueba por WhatsApp.',
      data: {
        phone: result.phone,
        mode: result.mode,
        status: result.status,
        providerMessageId: result.providerMessageId,
        templateName,
        languageCode,
        errorMessage: result.errorMessage,
      },
      error: result.status === 'ERROR' ? result.errorMessage : undefined,
    };
  }

  async sendSaleReceipt(dto: SendSaleReceiptDto, user: AuthenticatedUser) {
    return this.sendSaleReceiptWithStrategy(dto, user, dto.sendStrategy ?? dto.mode);
  }

  async sendSaleReceiptTemplate(dto: SendSaleReceiptDto, user: AuthenticatedUser) {
    return this.sendSaleReceiptWithStrategy({ ...dto, sendStrategy: 'receipt_template' }, user, 'receipt_template');
  }

  async createReceiptLink(dto: CreateReceiptLinkDto, user: AuthenticatedUser) {
    const receipt = await this.resolveReceiptSummary(dto.type, dto.id);
    const phone = dto.phone ? this.normalizeWhatsappPhone(dto.phone) : '';
    const receiptUrl = this.buildPublicReceiptUrl(dto.type, receipt.id);
    const message = this.buildReceiptLinkMessage(receipt, receiptUrl);
    const whatsappUrl = phone ? buildWhatsAppReceiptUrl(phone, message) : '';

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        module: 'WHATSAPP',
        action: 'CREATE_RECEIPT_LINK',
        description: `Link WhatsApp generado para ${dto.type} ${receipt.code}`,
        entityId: receipt.id,
        entityType: dto.type,
      },
    });

    return {
      success: true,
      receiptUrl,
      whatsappUrl,
      message,
      data: {
        type: dto.type,
        id: receipt.id,
        code: receipt.code,
        phone,
        customerName: receipt.customerName,
        total: receipt.total,
      },
    };
  }

  async sendReceipt(dto: SendReceiptDto, user: AuthenticatedUser) {
    const startedAt = Date.now();
    const receipt = await this.resolveReceiptSummary(dto.type, dto.id);
    const phone = this.normalizeWhatsappPhone(dto.phone);
    const receiptUrl = this.buildPublicReceiptUrl(dto.type, receipt.id, true);
    const htmlReceiptUrl = this.buildPublicReceiptUrl(dto.type, receipt.id);
    const filename = `comprobante-${receipt.code}.pdf`;
    const mode = this.mode();
    const enabled = this.config.get<string>('WHATSAPP_ENABLED') === 'true';
    const fallbackEnabled = this.config.get<string>('WHATSAPP_FALLBACK_TO_LINK') !== 'false';

    if (mode !== 'cloud_api' || !enabled) {
      return this.createManualReceiptResponse(dto.type, receipt, phone, htmlReceiptUrl, 'Modo link activo. Se genero enlace manual.', startedAt, user.id);
    }

    this.logger.log(
      `WhatsApp receipt send | mode=cloud_api | tokenConfigured=${Boolean(this.config.get<string>('WHATSAPP_CLOUD_TOKEN') || this.config.get<string>('WHATSAPP_ACCESS_TOKEN'))} | phoneNumberIdConfigured=${Boolean(this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID'))} | to=${this.maskPhone(phone)} | receiptType=${dto.type} | receiptId=${receipt.id}`,
    );

    const result = await this.cloud.sendDocumentLink(
      phone,
      receiptUrl,
      filename,
      `Comprobante ${receipt.code} - Innova Solutions`,
    );

    const deliveryConfirmed = result.status === 'SENT' && Boolean(result.providerMessageId);
    if (deliveryConfirmed) {
      await this.auditReceiptSend(user.id, dto.type, receipt.id, receipt.code, 'SEND_RECEIPT_CLOUD_API', result.providerMessageId, false);
      return {
        success: true,
        mode: 'cloud_api',
        status: 'SENT',
        deliveryConfirmed: true,
        manualSendRequired: false,
        to: phone,
        receiptUrl,
        filename,
        providerMessageId: result.providerMessageId,
        message: 'Comprobante PDF enviado por WhatsApp.',
        durationMs: Date.now() - startedAt,
      };
    }

    if (fallbackEnabled) {
      const manual = await this.createManualReceiptResponse(
        dto.type,
        receipt,
        phone,
        htmlReceiptUrl,
        'No se pudo enviar automaticamente. Se genero enlace manual.',
        startedAt,
        user.id,
        result.errorMessage ?? 'Meta rechazo el envio.',
      );
      await this.auditReceiptSend(user.id, dto.type, receipt.id, receipt.code, 'SEND_RECEIPT_FALLBACK_LINK', result.providerMessageId, true);
      return manual;
    }

    await this.auditReceiptSend(user.id, dto.type, receipt.id, receipt.code, 'SEND_RECEIPT_FAILED', result.providerMessageId, false);
    return {
      success: false,
      mode: 'cloud_api',
      status: 'ERROR',
      deliveryConfirmed: false,
      manualSendRequired: false,
      to: phone,
      receiptUrl,
      filename,
      message: 'No se pudo enviar el comprobante.',
      details: result.errorMessage ?? 'Meta rechazo el envio.',
      durationMs: Date.now() - startedAt,
    };
  }

  async testApprovedTemplate(dto: TestApprovedTemplateDto, user: AuthenticatedUser) {
    const normalizedPhone = this.normalizeWhatsappPhone(dto.phone);
    const template = dto.template ?? 'comprobante_pdf';
    const mode = this.mode();

    if (mode === 'mock') {
      const result = await this.sendAndLog(
        normalizedPhone,
        `Prueba de plantilla aprobada: ${template}`,
        user.id,
        'whatsapp',
        'test-approved-template',
        template,
        'TEST_APPROVED_TEMPLATE',
      );

      return {
        success: true,
        message: 'Modo prueba activo: plantilla aprobada simulada correctamente.',
        data: {
          phone: result.phone,
          mode: result.mode,
          status: result.status,
          templateName: template,
          providerMessageId: result.providerMessageId,
          mediaId: result.mediaId,
        },
      };
    }

    let result: WhatsappResponse;
    let mediaId: string | undefined;
    const languageCode = template === 'hello_world'
      ? this.config.get<string>('WHATSAPP_TEMPLATE_TEST_LANGUAGE')?.trim() || 'en_US'
      : this.config.get<string>('WHATSAPP_TEMPLATE_LANGUAGE')?.trim() || 'es_PE';

    if (template === 'hello_world') {
      result = await this.cloud.sendHelloWorldTemplate(normalizedPhone);
    } else if (template === 'comprobante_venta') {
      result = await this.cloud.sendReceiptTemplate(normalizedPhone, {
        customerName: 'Cliente de prueba',
        documentCode: 'TEST-000001',
      });
    } else {
      const filename = 'comprobante-test.pdf';
      const pdfBuffer = await this.buildApprovedTemplateTestPdf();
      const upload = await this.cloud.uploadDocument(pdfBuffer, filename);
      if (upload.status === 'ERROR') {
        result = {
          status: 'ERROR',
          mode: 'real',
          errorMessage: upload.errorMessage ?? 'No se pudo subir el PDF a Meta.',
          httpStatus: upload.httpStatus,
          metaResponse: upload.metaResponse,
          endpoint: upload.endpoint,
        };
      } else {
        mediaId = upload.mediaId;
        result = await this.cloud.sendReceiptPdfTemplate(
          normalizedPhone,
          upload.mediaId,
          filename,
          'Cliente de prueba',
          'TEST-000001',
          this.config.get<string>('WHATSAPP_RECEIPT_PDF_TEMPLATE_NAME')?.trim() || 'comprobante_pdf',
          languageCode,
        );
      }
    }

    const success = result.status === 'SENT' && Boolean(result.providerMessageId);
    const log = await this.prisma.whatsappMessageLog.create({
      data: {
        phone: normalizedPhone,
        messageType: 'template',
        templateName: template,
        content: `Prueba de plantilla aprobada: ${template}`,
        status: result.status,
        providerMessageId: result.providerMessageId,
        errorMessage: result.errorMessage,
        relatedModule: 'whatsapp',
        relatedId: 'test-approved-template',
        userId: user.id,
      },
    });
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        module: 'WHATSAPP',
        action: success ? 'TEST_APPROVED_TEMPLATE' : 'TEST_APPROVED_TEMPLATE_FAILED',
        description: `Prueba plantilla ${template} a ${normalizedPhone}: ${result.status}`,
        entityId: log.id,
        entityType: 'WhatsappMessageLog',
      },
    });

    return {
      success,
      message: success
        ? template === 'comprobante_pdf'
          ? 'Plantilla comprobante_pdf con PDF enviada por WhatsApp correctamente.'
          : 'Plantilla aprobada enviada por WhatsApp correctamente.'
        : result.errorMessage ?? 'No se pudo enviar la plantilla aprobada.',
      data: {
        phone: normalizedPhone,
        mode: result.mode.toUpperCase(),
        status: result.status,
        templateName: template,
        languageCode,
        providerMessageId: result.providerMessageId,
        mediaId: result.mediaId ?? mediaId,
        errorMessage: result.errorMessage,
      },
      error: result.status === 'ERROR' ? result.errorMessage : undefined,
    };
  }

  private async sendSaleReceiptWithStrategy(dto: SendSaleReceiptDto, user: AuthenticatedUser, requestedStrategy?: SendSaleReceiptDto['sendStrategy']) {
    if (this.mode() === 'link') {
      return this.createReceiptLink({ type: 'SALE', id: dto.saleId, phone: dto.phone }, user);
    }

    const sale = await this.salesService.findOne(dto.saleId);

    if (sale.status === 'CANCELLED') {
      throw new BadRequestException('No se puede enviar comprobante de una venta anulada.');
    }

    const strategy = this.resolveStrategy(requestedStrategy, dto.sendPdf);
    const sendPdf = strategy === 'document' || strategy === 'receipt_pdf';
    const message = this.buildSaleReceiptMessage(sale);
    const pdfReceipt = sendPdf ? await this.salesService.receiptPdf(sale.id) : undefined;
    const templateConfig = this.resolveTemplateConfig(strategy);
    const result = await this.sendAndLog(
      dto.phone,
      strategy === 'template_test' || strategy === 'receipt_template' || strategy === 'receipt_pdf' ? `Plantilla WhatsApp: ${templateConfig.templateName}` : message,
      user.id,
      'sales',
      sale.id,
      strategy === 'template_test' || strategy === 'receipt_template' || strategy === 'receipt_pdf' ? templateConfig.templateName : sendPdf ? 'sale-receipt-pdf' : 'sale-receipt',
      strategy === 'template_test'
        ? 'SEND_SALE_RECEIPT_TEMPLATE_TEST'
        : strategy === 'receipt_template'
          ? 'SEND_SALE_RECEIPT_TEMPLATE'
          : strategy === 'receipt_pdf'
            ? 'SEND_RECEIPT_PDF'
            : sendPdf
              ? 'SEND_SALE_RECEIPT_PDF'
              : 'SEND_SALE_RECEIPT',
      pdfReceipt
        ? {
            pdfBuffer: pdfReceipt.buffer,
            filename: pdfReceipt.filename,
            caption: `Hola, gracias por tu compra en Innova Solutions. Te enviamos tu comprobante ${sale.code}.`,
            receiptTemplate: strategy === 'receipt_pdf'
              ? {
                  templateName: templateConfig.templateName,
                  languageCode: templateConfig.languageCode,
                  customerName: sale.customer?.fullName ?? 'Cliente',
                  documentCode: sale.code,
                }
              : undefined,
          }
        : undefined,
      strategy === 'template_test' || strategy === 'receipt_template' ? templateConfig : undefined,
    );
    const success = result.status === 'SENT' && (result.mode === 'MOCK' || Boolean(result.providerMessageId));
    return {
      success,
      message: success ? this.resolveSaleReceiptResponseMessage(result.mode, result.status, strategy) : this.resolveSaleReceiptErrorMessage(strategy, result.errorMessage),
      data: {
        saleId: sale.id,
        phone: result.phone,
        mode: result.mode,
        strategy,
        status: result.status,
        providerMessageId: result.providerMessageId,
        mediaId: result.mediaId,
        templateName: strategy === 'template_test' || strategy === 'receipt_template' || strategy === 'receipt_pdf' ? templateConfig.templateName : undefined,
        errorMessage: result.errorMessage,
      },
      error: result.status === 'ERROR' ? result.errorMessage : undefined,
    };
  }

  sendServiceOrder(dto: SendServiceOrderDto, user: AuthenticatedUser) {
    return this.mockSend(dto.phone, serviceOrderTemplate(dto.orderCode, dto.status), user.id, 'service-orders', dto.orderCode);
  }

  sendNotification(dto: SendMessageDto, user: AuthenticatedUser) {
    return this.mockSend(dto.phone, notificationTemplate(dto.message), user.id, dto.relatedModule, dto.relatedId);
  }

  sendTemplate(dto: SendTemplateMessageDto, user: AuthenticatedUser) {
    const params = Object.entries(dto.parameters ?? {}).map(([key, value]) => `${key}: ${value}`).join(' | ');
    return this.mockSend(dto.phone, `Plantilla ${dto.templateName}${params ? ` - ${params}` : ''}`, user.id, dto.relatedModule, dto.relatedId, dto.templateName);
  }

  messages() {
    return this.prisma.whatsappMessageLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async testConnection(user: AuthenticatedUser) {
    const mode = this.mode();
    const status = mode === 'mock' ? 'MOCK' : this.cloud.isConfigured() ? 'CONFIGURED' : 'ERROR';
    await this.prisma.auditLog.create({ data: { userId: user.id, module: 'whatsapp', action: 'TEST_CONNECTION', description: `Prueba WhatsApp: ${status}`, entityType: 'WhatsappMessageLog' } });
    return { mode, status, message: mode === 'mock' ? 'Modo mock activo' : this.cloud.isConfigured() ? 'Credenciales disponibles' : 'Faltan credenciales' };
  }

  private async mockSend(phone: string, message: string, userId: string, relatedModule?: string, relatedId?: string, templateName?: string) {
    return this.sendAndLog(phone, message, userId, relatedModule, relatedId, templateName);
  }

  private async sendAndLog(
    phone: string,
    message: string,
    userId: string,
    relatedModule?: string,
    relatedId?: string,
    templateName?: string,
    auditAction = 'SEND_WHATSAPP_MESSAGE',
    document?: {
      pdfBuffer: Buffer;
      filename: string;
      caption: string;
      receiptTemplate?: { templateName: string; languageCode: string; customerName: string; documentCode: string };
    },
    template?: { templateName: string; languageCode: string },
  ) {
    const normalizedPhone = this.normalizeWhatsappPhone(phone);

    const mode = this.mode();
    const strategyLog = document?.receiptTemplate ? 'receipt_pdf' : template ? 'template' : document ? 'document' : 'text';
    this.logger.log(
      `WhatsApp send request | mode=${mode} | strategy=${strategyLog} | phone=${normalizedPhone} | templateName=${document?.receiptTemplate?.templateName ?? template?.templateName ?? templateName ?? 'none'} | document=${Boolean(document)}`,
    );
    let result: WhatsappResponse;
    if (mode === 'mock') {
      result = this.mock.send();
    } else if (document?.receiptTemplate) {
      result = await this.sendReceiptPdfTemplate(normalizedPhone, {
        pdfBuffer: document.pdfBuffer,
        filename: document.filename,
        receiptTemplate: document.receiptTemplate,
      });
    } else if (template) {
      result = template.templateName === (this.config.get<string>('WHATSAPP_RECEIPT_TEMPLATE_NAME')?.trim() || 'comprobante_venta')
        ? await this.cloud.sendReceiptTemplate(normalizedPhone, {
            customerName: 'Cliente',
            documentCode: relatedId ?? 'COMPROBANTE',
          })
        : await this.cloud.sendTemplateMessage(normalizedPhone, template.templateName, template.languageCode);
    } else if (document) {
      result = await this.cloud.sendDocument(normalizedPhone, document.pdfBuffer, document.filename, document.caption);
    } else {
      result = await this.cloud.sendText(normalizedPhone, message);
    }
    const log = await this.prisma.whatsappMessageLog.create({
      data: {
        phone: normalizedPhone,
        messageType: templateName || template || document?.receiptTemplate ? 'template' : document ? 'document' : 'text',
        templateName,
        content: message,
        status: result.status,
        providerMessageId: result.providerMessageId,
        errorMessage: result.errorMessage,
        relatedModule,
        relatedId,
        userId,
      },
    });
    const finalStatus = result.status === 'MOCK_SENT' ? 'SENT' : result.status;
    await this.prisma.auditLog.create({
      data: {
        userId,
        module: 'WHATSAPP',
        action: finalStatus === 'ERROR' && auditAction === 'SEND_RECEIPT_PDF' ? 'SEND_RECEIPT_PDF_FAILED' : auditAction,
        description: `Envio WhatsApp ${result.mode} a ${normalizedPhone}: ${finalStatus}${relatedId ? ` (${relatedId})` : ''}`,
        entityId: log.id,
        entityType: 'WhatsappMessageLog',
      },
    });
    return {
      id: log.id,
      phone: normalizedPhone,
      message,
      mode: result.mode.toUpperCase(),
      status: finalStatus,
      providerMessageId: result.providerMessageId,
      mediaId: result.mediaId,
      errorMessage: result.errorMessage,
    };
  }

  private mode() {
    return (this.config.get<string>('WHATSAPP_MODE') ?? 'mock').trim().toLowerCase();
  }

  private async sendReceiptPdfTemplate(
    phone: string,
    document: {
      pdfBuffer: Buffer;
      filename: string;
      receiptTemplate: { templateName: string; languageCode: string; customerName: string; documentCode: string };
    },
  ): Promise<WhatsappResponse> {
    const upload = await this.cloud.uploadDocument(document.pdfBuffer, document.filename);
    if (upload.status === 'ERROR') {
      return {
        status: 'ERROR' as const,
        mode: 'real' as const,
        errorMessage: upload.errorMessage,
        httpStatus: upload.httpStatus,
        metaResponse: upload.metaResponse,
        endpoint: upload.endpoint,
      };
    }
    this.logger.log(
      `WhatsApp PDF uploaded | strategy=receipt_pdf | mediaId=${upload.mediaId} | templateName=${document.receiptTemplate.templateName}`,
    );
    return this.cloud.sendReceiptPdfTemplate(
      phone,
      upload.mediaId,
      document.filename,
      document.receiptTemplate.customerName,
      document.receiptTemplate.documentCode,
      document.receiptTemplate.templateName,
      document.receiptTemplate.languageCode,
    );
  }

  private resolveStrategy(requested?: SendSaleReceiptDto['sendStrategy'], sendPdf?: boolean): WhatsappSendStrategy {
    if (!requested && sendPdf) return 'receipt_pdf';
    const raw = (requested ?? this.config.get<string>('WHATSAPP_SEND_STRATEGY') ?? 'template_test').trim().toLowerCase();
    if (raw === 'template_test' || raw === 'receipt_template' || raw === 'receipt_pdf' || raw === 'text' || raw === 'document') return raw;
    if (raw === 'auto') {
      return (this.config.get<string>('NODE_ENV') ?? 'development').trim().toLowerCase() === 'production'
        ? 'receipt_pdf'
        : 'template_test';
    }
    return 'template_test';
  }

  private resolveTemplateConfig(strategy: WhatsappSendStrategy) {
    if (strategy === 'receipt_pdf') {
      return {
        templateName: this.config.get<string>('WHATSAPP_RECEIPT_PDF_TEMPLATE_NAME')?.trim() || 'comprobante_pdf',
        languageCode: this.config.get<string>('WHATSAPP_TEMPLATE_LANGUAGE')?.trim() || 'es_PE',
      };
    }
    if (strategy === 'receipt_template') {
      return {
        templateName: this.config.get<string>('WHATSAPP_RECEIPT_TEMPLATE_NAME')?.trim() || 'comprobante_venta',
        languageCode: this.config.get<string>('WHATSAPP_TEMPLATE_LANGUAGE')?.trim() || this.config.get<string>('WHATSAPP_RECEIPT_TEMPLATE_LANGUAGE')?.trim() || 'es_PE',
      };
    }
    return {
      templateName: this.config.get<string>('WHATSAPP_TEMPLATE_TEST_NAME')?.trim() || 'hello_world',
      languageCode: this.config.get<string>('WHATSAPP_TEMPLATE_TEST_LANGUAGE')?.trim() || 'en_US',
    };
  }

  private normalizeWhatsappPhone(phone: string) {
    return normalizePhoneForWhatsApp(phone, this.config.get<string>('WHATSAPP_DEFAULT_COUNTRY_CODE') ?? '51');
  }

  private resolveSaleReceiptResponseMessage(mode: string, status: string, strategy: WhatsappSendStrategy) {
    if (status === 'ERROR') return 'No se pudo enviar el comprobante por WhatsApp.';
    if (mode === 'MOCK') return 'Modo prueba activo: envio simulado correctamente.';
    if (strategy === 'template_test') return 'Mensaje de prueba enviado por WhatsApp correctamente.';
    if (strategy === 'receipt_template') return 'Plantilla de comprobante enviada por WhatsApp correctamente.';
    if (strategy === 'document' || strategy === 'receipt_pdf') return 'Comprobante PDF enviado por WhatsApp correctamente.';
    return 'Comprobante enviado por WhatsApp correctamente.';
  }

  private resolveSaleReceiptErrorMessage(strategy: WhatsappSendStrategy, providerError?: string) {
    if (strategy === 'receipt_template') {
      const templateName = this.config.get<string>('WHATSAPP_RECEIPT_TEMPLATE_NAME')?.trim() || 'comprobante_venta';
      return `La plantilla ${templateName} no esta aprobada o no existe en Meta. Usa hello_world para pruebas.`;
    }
    if (strategy === 'receipt_pdf') {
      return providerError ?? 'No se pudo enviar el comprobante PDF por WhatsApp.';
    }
    if (strategy === 'document') {
      return 'No se pudo enviar el PDF. Verifica que exista ventana de conversacion activa o una plantilla aprobada.';
    }
    return providerError ?? 'No se pudo enviar el comprobante por WhatsApp.';
  }

  private buildSaleReceiptMessage(sale: any) {
    const date = new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(sale.createdAt));
    const customer = sale.customer?.fullName ?? 'Cliente general';

    return [
      'Hola, gracias por tu compra en Innova Solutions.',
      '',
      `Comprobante: ${sale.code}`,
      `Cliente: ${customer}`,
      `Total: S/ ${Number(sale.total).toFixed(2)}`,
      `Fecha: ${date}`,
      'Estado: Venta registrada correctamente.',
      '',
      'Puedes solicitar tu comprobante en tienda o revisarlo desde el sistema.',
      '',
      'Gracias por confiar en nosotros.',
    ].join('\n');
  }

  private async resolveReceiptSummary(type: CreateReceiptLinkDto['type'], idOrCode: string) {
    if (type === 'SALE') {
      const sale = await this.prisma.sale.findFirst({
        where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
        include: { customer: true, payments: true },
      });
      if (!sale) throw new BadRequestException('No se encontro el comprobante de venta.');
      if (sale.status === 'CANCELLED') throw new BadRequestException('No se puede compartir una venta anulada.');
      return {
        id: sale.id,
        code: sale.code,
        customerName: sale.customer?.fullName ?? 'Cliente general',
        total: Number(sale.total),
        paymentMethod: sale.payments[0]?.method ?? 'MIXED',
        createdAt: sale.createdAt,
      };
    }

    if (type === 'QUICK_SERVICE') {
      const sale = await this.prisma.quickServiceSale.findFirst({
        where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
        include: { customer: true },
      });
      if (!sale) throw new BadRequestException('No se encontro el comprobante de servicio rapido.');
      if (sale.status === 'CANCELLED') throw new BadRequestException('No se puede compartir una operacion cancelada.');
      return {
        id: sale.id,
        code: sale.code,
        customerName: sale.customer?.fullName ?? 'Cliente general',
        total: Number(sale.total),
        paymentMethod: sale.paymentMethod,
        createdAt: sale.createdAt,
      };
    }

    const order = await this.prisma.serviceOrder.findFirst({
      where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
      include: { customer: true },
    });
    if (!order) throw new BadRequestException('No se encontro la orden tecnica.');
    return {
      id: order.id,
      code: order.code,
      customerName: order.customer.fullName,
      total: Number(order.total),
      paymentMethod: 'PENDIENTE',
      createdAt: order.createdAt,
    };
  }

  private buildPublicReceiptUrl(type: CreateReceiptLinkDto['type'], id: string, pdf = false) {
    const baseUrl = this.resolvePublicAppUrl();
    const path = type === 'SALE'
      ? `/api/public/receipts/sales/${encodeURIComponent(id)}`
      : type === 'QUICK_SERVICE'
        ? `/api/public/receipts/quick-services/${encodeURIComponent(id)}`
        : `/api/public/receipts/service-orders/${encodeURIComponent(id)}`;

    return `${baseUrl}${path}${pdf ? '/pdf' : ''}`;
  }

  private resolvePublicAppUrl() {
    const configured = this.config.get<string>('PUBLIC_APP_URL')?.trim();
    const nodeEnv = (this.config.get<string>('NODE_ENV') ?? 'development').trim().toLowerCase();
    if (configured) {
      const normalized = configured.replace(/\/+$/, '');
      if (nodeEnv === 'production' && /localhost|127\.0\.0\.1/i.test(normalized)) {
        throw new BadRequestException('PUBLIC_APP_URL no puede apuntar a localhost en produccion.');
      }
      return normalized;
    }

    if (nodeEnv === 'production') {
      throw new BadRequestException('PUBLIC_APP_URL es obligatorio para compartir comprobantes en produccion.');
    }

    const port = this.config.get<string>('PORT')?.trim() || '3000';
    return `http://localhost:${port}`;
  }

  private buildReceiptLinkMessage(receipt: { code: string; customerName: string; total: number; createdAt: Date }, receiptUrl: string) {
    return [
      `Hola ${receipt.customerName}, gracias por tu compra en Innova Solutions.`,
      '',
      'Tu comprobante:',
      receiptUrl,
      '',
      `Total: S/ ${receipt.total.toFixed(2)}`,
      `Codigo: ${receipt.code}`,
      '',
      'Gracias por confiar en nosotros.',
    ].join('\n');
  }

  private createManualReceiptResponse(
    type: CreateReceiptLinkDto['type'],
    receipt: { id: string; code: string; customerName: string; total: number; createdAt: Date },
    phone: string,
    receiptUrl: string,
    message: string,
    startedAt: number,
    userId: string,
    warning?: string,
  ) {
    const text = this.buildReceiptLinkMessage(receipt, receiptUrl);
    const whatsappUrl = buildWhatsAppReceiptUrl(phone, text);

    return this.prisma.auditLog.create({
      data: {
        userId,
        module: 'WHATSAPP',
        action: warning ? 'SEND_RECEIPT_MANUAL_FALLBACK' : 'CREATE_RECEIPT_LINK',
        description: `${type} ${receipt.code}: ${message}${warning ? ` ${warning}` : ''}`,
        entityId: receipt.id,
        entityType: type,
      },
    }).then(() => ({
      success: true,
      mode: 'link',
      status: 'READY_TO_SEND',
      deliveryConfirmed: false,
      manualSendRequired: true,
      to: phone,
      receiptUrl,
      whatsappUrl,
      message,
      warning,
      durationMs: Date.now() - startedAt,
    }));
  }

  private auditReceiptSend(userId: string, type: string, id: string, code: string, action: string, providerMessageId?: string, fallbackUsed = false) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        module: 'WHATSAPP',
        action,
        description: `${type} ${code}: providerMessageId=${providerMessageId ?? 'none'} fallbackUsed=${fallbackUsed}`,
        entityId: id,
        entityType: type,
      },
    });
  }

  private maskPhone(phone: string) {
    if (phone.length < 7) return '***';
    return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
  }

  private buildApprovedTemplateTestPdf(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];

      document.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      document
        .fillColor('#0f172a')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('Innova Solutions');
      document
        .moveDown(0.6)
        .fontSize(14)
        .fillColor('#1d4ed8')
        .text('COMPROBANTE DE VENTA - PRUEBA WHATSAPP');
      document
        .moveDown()
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#334155')
        .text('Codigo: TEST-000001')
        .text('Cliente: Cliente de prueba')
        .text(`Fecha: ${new Date().toLocaleString('es-PE')}`)
        .moveDown()
        .text('Este PDF valida la subida a Meta /media y el envio con la plantilla aprobada comprobante_pdf.');
      document
        .moveDown(2)
        .font('Helvetica-Bold')
        .fillColor('#16a34a')
        .text('Total: S/ 0.00');
      document.end();
    });
  }
}
