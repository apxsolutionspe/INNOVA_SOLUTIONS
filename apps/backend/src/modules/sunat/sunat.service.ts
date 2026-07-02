import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SunatDocumentStatus, SunatDocumentType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateBoletaDto } from './dto/create-boleta.dto';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { CreateDebitNoteDto } from './dto/create-debit-note.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { SunatDocumentQueryDto } from './dto/sunat-document-query.dto';
import { SunatCpeProvider } from './providers/sunat-cpe.provider';
import { SunatMockProvider } from './providers/sunat-mock.provider';
import { defaultSeries } from './utils/sunat-document-number.util';

@Injectable()
export class SunatService {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService, private readonly mock: SunatMockProvider, private readonly cpe: SunatCpeProvider) {}

  configStatus() {
    return { mode: this.mode(), ruc: this.config.get('SUNAT_RUC') ?? null, apiUrl: this.config.get('SUNAT_API_URL') ?? null, configured: this.hasCredentials() };
  }

  async createBoleta(dto: CreateBoletaDto, user: AuthenticatedUser) {
    return this.createDocument(SunatDocumentType.BOLETA, dto, user);
  }

  async createFactura(dto: CreateInvoiceDto, user: AuthenticatedUser) {
    return this.createDocument(SunatDocumentType.FACTURA, dto, user);
  }

  createCreditNote(dto: CreateCreditNoteDto, user: AuthenticatedUser) {
    return this.createDocument(SunatDocumentType.NOTA_CREDITO, { ...dto, customerName: 'Cliente relacionado', customerDocument: '00000000', items: [], total: dto.total }, user);
  }

  createDebitNote(dto: CreateDebitNoteDto, user: AuthenticatedUser) {
    return this.createDocument(SunatDocumentType.NOTA_DEBITO, { ...dto, customerName: 'Cliente relacionado', customerDocument: '00000000', items: [], total: dto.total }, user);
  }

  documents(query: SunatDocumentQueryDto) {
    return this.prisma.sunatDocument.findMany({ where: { documentType: query.documentType, status: query.status }, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async document(id: string) {
    const doc = await this.prisma.sunatDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento SUNAT no encontrado');
    return doc;
  }

  async documentStatus(id: string) {
    const doc = await this.document(id);
    return { id: doc.id, status: doc.status, ticket: doc.sunatTicket, responseCode: doc.sunatResponseCode, message: doc.sunatResponseMessage };
  }

  async testConnection(user: AuthenticatedUser) {
    const response = this.mode() === 'mock' ? this.mock.test() : await this.cpe.emitPrepared(SunatDocumentType.BOLETA);
    await this.prisma.auditLog.create({ data: { userId: user.id, module: 'sunat', action: 'TEST_CONNECTION', description: response.responseMessage, entityType: 'SunatDocument' } });
    return response;
  }

  private async createDocument(type: SunatDocumentType, dto: CreateInvoiceDto, user: AuthenticatedUser) {
    if (dto.relatedSaleId) {
      const sale = await this.prisma.sale.findUnique({ where: { id: dto.relatedSaleId } });
      if (!sale) throw new NotFoundException('Venta relacionada no encontrada');
      if (sale.status === 'CANCELLED') throw new BadRequestException('No se puede emitir comprobante de una venta anulada');
    }

    const response = this.mode() === 'mock' ? this.mock.emit(type, dto.total) : await this.cpe.emitPrepared(type);
    const series = defaultSeries(type);
    const number = (await this.prisma.sunatDocument.count({ where: { documentType: type, series } })) + 1;
    const subtotal = dto.subtotal ?? Math.round((dto.total / 1.18) * 100) / 100;
    const taxTotal = dto.taxTotal ?? Math.round((dto.total - subtotal) * 100) / 100;
    const document = await this.prisma.sunatDocument.create({
      data: {
        saleId: dto.relatedSaleId,
        serviceOrderId: dto.relatedServiceOrderId,
        documentType: type,
        series,
        number,
        customerDocumentType: dto.customerDocumentType ?? 'DNI',
        customerDocumentNumber: dto.customerDocument,
        customerName: dto.customerName,
        subtotal,
        taxTotal,
        total: dto.total,
        status: response.status,
        sunatTicket: response.ticket,
        sunatResponseCode: response.responseCode,
        sunatResponseMessage: response.responseMessage,
      },
    });
    await this.prisma.auditLog.create({ data: { userId: user.id, module: 'sunat', action: `CREATE_${type}`, description: response.responseMessage, entityId: document.id, entityType: 'SunatDocument' } });
    return { ...document, mode: this.mode(), message: response.responseMessage };
  }

  private hasCredentials() {
    return Boolean(this.config.get('SUNAT_CLIENT_ID') && this.config.get('SUNAT_CLIENT_SECRET') && this.config.get('SUNAT_RUC'));
  }

  private mode() {
    return this.config.get<string>('SUNAT_MODE') ?? 'mock';
  }
}
