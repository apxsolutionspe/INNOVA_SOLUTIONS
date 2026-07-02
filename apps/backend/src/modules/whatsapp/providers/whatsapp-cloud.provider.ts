import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappResponse } from '../interfaces/whatsapp-response.interface';

@Injectable()
export class WhatsappCloudProvider {
  private readonly logger = new Logger(WhatsappCloudProvider.name);

  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    const credentials = this.credentials();
    return Boolean(credentials.token && credentials.token.length >= 20 && credentials.phoneNumberId);
  }

  async sendText(phone: string, message: string): Promise<WhatsappResponse> {
    const credentials = this.credentials();
    if (!this.isConfigured()) return this.credentialsError();
    const { baseUrl, version, phoneNumberId, token } = credentials;
    const endpoint = `${baseUrl}/${version}/${phoneNumberId}/messages`;
    this.logRequest('text', phone, endpoint);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: message } }),
      });
      const data = await response.json().catch(() => ({}));
      this.logResponse('text', response.status, data);
      if (!response.ok) return this.metaErrorResponse(data, response.status, endpoint, 'Error enviando WhatsApp');
      const providerMessageId = data?.messages?.[0]?.id;
      if (!providerMessageId) return { status: 'ERROR', mode: 'real', errorMessage: 'Meta no devolvio messages[0].id.', httpStatus: response.status, metaResponse: data, endpoint };
      this.logger.log(`[WhatsApp] send status=${response.status} providerMessageId=${providerMessageId}`);
      return { status: 'SENT', mode: 'real', providerMessageId, httpStatus: response.status, metaResponse: data, endpoint };
    } catch {
      this.logger.error(`WhatsApp Cloud text request failed | phone=${phone} | endpoint=${endpoint}`);
      return { status: 'ERROR', mode: 'real', errorMessage: 'No se pudo conectar con WhatsApp Cloud API.', endpoint };
    }
  }

  sendHelloWorldTemplate(phone: string): Promise<WhatsappResponse> {
    const templateName = this.config.get<string>('WHATSAPP_TEMPLATE_TEST_NAME')?.trim() || 'hello_world';
    const languageCode = this.config.get<string>('WHATSAPP_TEMPLATE_TEST_LANGUAGE')?.trim() || 'en_US';
    return this.sendTemplateMessage(phone, templateName, languageCode);
  }

  sendReceiptTemplate(phone: string, data: { customerName: string; documentCode: string }): Promise<WhatsappResponse> {
    const templateName = this.config.get<string>('WHATSAPP_RECEIPT_TEMPLATE_NAME')?.trim() || 'comprobante_venta';
    const languageCode = this.config.get<string>('WHATSAPP_TEMPLATE_LANGUAGE')?.trim()
      || this.config.get<string>('WHATSAPP_RECEIPT_TEMPLATE_LANGUAGE')?.trim()
      || 'es_PE';
    return this.sendTemplateMessage(phone, templateName, languageCode, [
      { type: 'text', text: data.customerName || 'Cliente' },
      { type: 'text', text: data.documentCode },
    ]);
  }

  async sendTemplateMessage(
    phone: string,
    templateName: string,
    languageCode: string,
    bodyParameters?: Array<{ type: 'text'; text: string }>,
  ): Promise<WhatsappResponse> {
    const credentials = this.credentials();
    if (!this.isConfigured()) return this.credentialsError();
    const { baseUrl, version, phoneNumberId, token } = credentials;
    const endpoint = `${baseUrl}/${version}/${phoneNumberId}/messages`;
    this.logRequest(`template:${templateName}`, phone, endpoint, { templateName, languageCode, document: false });

    try {
      const components = bodyParameters?.length
        ? [{ type: 'body', parameters: bodyParameters }]
        : undefined;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            ...(components ? { components } : {}),
          },
        }),
      });
      const data = await response.json().catch(() => ({}));
      this.logResponse(`template:${templateName}`, response.status, data);
      if (!response.ok) return this.metaErrorResponse(data, response.status, endpoint, this.templateFallback(templateName, languageCode));
      const providerMessageId = data?.messages?.[0]?.id;
      if (!providerMessageId) return { status: 'ERROR', mode: 'real', errorMessage: 'Meta no devolvio messages[0].id para la plantilla.', httpStatus: response.status, metaResponse: data, endpoint };
      this.logger.log(`[WhatsApp] send status=${response.status} providerMessageId=${providerMessageId}`);
      return { status: 'SENT', mode: 'real', providerMessageId, httpStatus: response.status, metaResponse: data, endpoint };
    } catch {
      this.logger.error(`WhatsApp Cloud template request failed | phone=${phone} | endpoint=${endpoint} | template=${templateName}`);
      return { status: 'ERROR', mode: 'real', errorMessage: 'No se pudo conectar con WhatsApp Cloud API.', endpoint };
    }
  }

  async sendDocument(phone: string, pdfBuffer: Buffer, filename: string, caption: string): Promise<WhatsappResponse> {
    if (!this.isConfigured()) return this.credentialsError();

    try {
      const upload = await this.uploadDocument(pdfBuffer, filename);
      if (upload.status === 'ERROR') {
        return {
          status: 'ERROR',
          mode: 'real',
          errorMessage: upload.errorMessage ?? 'Meta no devolvio media_id del comprobante.',
          httpStatus: upload.httpStatus,
          metaResponse: upload.metaResponse,
          endpoint: upload.endpoint,
        };
      }
      const mediaId = upload.mediaId;
      this.logger.log(`WhatsApp Cloud document media ready | phone=${phone} | mediaId=${mediaId} | filename=${filename}`);

      const { baseUrl, version, phoneNumberId, token } = this.credentials();
      const endpoint = `${baseUrl}/${version}/${phoneNumberId}/messages`;
      this.logRequest('document', phone, endpoint, { document: true });
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'document',
          document: {
            id: mediaId,
            filename,
            caption,
          },
        }),
      });
      const data = await response.json().catch(() => ({}));
      this.logResponse('document', response.status, data);
      if (!response.ok) return this.metaErrorResponse(data, response.status, endpoint, 'No se pudo enviar el PDF. Verifica que exista ventana de conversacion activa o una plantilla aprobada.', mediaId);
      const providerMessageId = data?.messages?.[0]?.id;
      if (!providerMessageId) return { status: 'ERROR', mode: 'real', errorMessage: 'Meta no devolvio messages[0].id para el documento.', httpStatus: response.status, metaResponse: data, endpoint };
      this.logger.log(`WhatsApp Cloud document sent | phone=${phone} | mediaId=${mediaId} | providerMessageId=${providerMessageId} | httpStatus=${response.status}`);
      return { status: 'SENT', mode: 'real', providerMessageId, mediaId, httpStatus: response.status, metaResponse: data, endpoint };
    } catch {
      this.logger.error(`WhatsApp Cloud document request failed | phone=${phone}`);
      return { status: 'ERROR', mode: 'real', errorMessage: 'No se pudo enviar el PDF por WhatsApp Cloud API.' };
    }
  }

  async uploadDocument(pdfBuffer: Buffer, filename: string) {
    if (!this.isConfigured()) {
      return { status: 'ERROR' as const, errorMessage: this.credentialsError().errorMessage };
    }

    const { baseUrl, version, phoneNumberId, token } = this.credentials();
    const formData = new FormData();
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength,
    ) as ArrayBuffer;
    formData.append('messaging_product', 'whatsapp');
    formData.append('type', 'application/pdf');
    formData.append('file', new Blob([arrayBuffer], { type: 'application/pdf' }), filename);

    const endpoint = `${baseUrl}/${version}/${phoneNumberId}/media`;
    this.logger.log(`[WhatsApp] mode=real strategy=media_upload endpoint=${endpoint} filename=${filename} bytes=${pdfBuffer.byteLength}`);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      this.logResponse('media', response.status, data);
      if (!response.ok) {
        const mapped = this.mapMetaError(data, 'No se pudo subir el PDF a Meta.');
        return {
          status: 'ERROR' as const,
          errorMessage: mapped,
          httpStatus: response.status,
          metaResponse: data,
          endpoint,
        };
      }
      const mediaId = data?.id as string | undefined;
      this.logger.log(`[WhatsApp] media status=${response.status} mediaId=${mediaId ?? 'none'}`);
      if (!mediaId) {
        return {
          status: 'ERROR' as const,
          errorMessage: 'Meta no devolvio media_id del comprobante.',
          httpStatus: response.status,
          metaResponse: data,
          endpoint,
        };
      }
      return { status: 'SENT' as const, mediaId, httpStatus: response.status, metaResponse: data, endpoint };
    } catch {
      this.logger.error(`WhatsApp Cloud media upload failed | endpoint=${endpoint} | filename=${filename}`);
      return { status: 'ERROR' as const, errorMessage: 'No se pudo subir el PDF a WhatsApp Cloud API.', endpoint };
    }
  }

  async sendReceiptPdfTemplate(
    phone: string,
    mediaId: string,
    filename: string,
    customerName: string,
    documentCode: string,
    templateName: string,
    languageCode: string,
  ): Promise<WhatsappResponse> {
    if (!this.isConfigured()) return this.credentialsError();
    const { baseUrl, version, phoneNumberId, token } = this.credentials();
    const endpoint = `${baseUrl}/${version}/${phoneNumberId}/messages`;
    this.logger.log(
      `[WhatsApp] mode=real strategy=receipt_pdf phone=${phone} template=${templateName} language=${languageCode} document=true mediaId=${mediaId} endpoint=${endpoint}`,
    );

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: [
              {
                type: 'header',
                parameters: [
                  {
                    type: 'document',
                    document: {
                      id: mediaId,
                      filename,
                    },
                  },
                ],
              },
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: customerName || 'Cliente' },
                  { type: 'text', text: documentCode },
                ],
              },
            ],
          },
        }),
      });
      const data = await response.json().catch(() => ({}));
      this.logResponse(`receipt_pdf:${templateName}`, response.status, data);
      if (!response.ok) {
        return {
          status: 'ERROR',
          mode: 'real',
          errorMessage: this.mapMetaError(data, this.templateFallback(templateName, languageCode)),
          httpStatus: response.status,
          metaResponse: data,
          endpoint,
          mediaId,
        };
      }
      const providerMessageId = data?.messages?.[0]?.id;
      if (!providerMessageId) {
        return {
          status: 'ERROR',
          mode: 'real',
          errorMessage: 'Meta no devolvio messages[0].id para la plantilla PDF.',
          httpStatus: response.status,
          metaResponse: data,
          endpoint,
          mediaId,
        };
      }
      this.logger.log(`[WhatsApp] send status=${response.status} mediaId=${mediaId} providerMessageId=${providerMessageId}`);
      return { status: 'SENT', mode: 'real', providerMessageId, mediaId, httpStatus: response.status, metaResponse: data, endpoint };
    } catch {
      this.logger.error(`WhatsApp Cloud receipt pdf template failed | phone=${phone} | templateName=${templateName} | mediaId=${mediaId}`);
      return { status: 'ERROR', mode: 'real', errorMessage: 'No se pudo enviar la plantilla PDF por WhatsApp Cloud API.', mediaId, endpoint };
    }
  }

  private credentials() {
    return {
      baseUrl: this.config.get<string>('WHATSAPP_API_URL')?.trim() || 'https://graph.facebook.com',
      version: this.config.get<string>('WHATSAPP_API_VERSION')?.trim() || 'v25.0',
      phoneNumberId: this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID')?.trim(),
      token: this.config.get<string>('WHATSAPP_ACCESS_TOKEN')?.trim(),
    };
  }

  private credentialsError(): WhatsappResponse {
    const credentials = this.credentials();
    const missing = [
      !credentials.phoneNumberId ? 'WHATSAPP_PHONE_NUMBER_ID' : undefined,
      !credentials.token ? 'WHATSAPP_ACCESS_TOKEN' : undefined,
      credentials.token && credentials.token.length < 20 ? 'WHATSAPP_ACCESS_TOKEN_INVALIDO' : undefined,
    ].filter(Boolean).join(', ');

    return {
      status: 'ERROR',
      mode: 'real',
      errorMessage: `Faltan credenciales validas de WhatsApp Cloud API${missing ? `: ${missing}` : '.'}`,
    };
  }

  private metaErrorResponse(data: any, httpStatus: number, endpoint: string, fallback: string, mediaId?: string): WhatsappResponse {
    return {
      status: 'ERROR',
      mode: 'real',
      errorMessage: this.mapMetaError(data, fallback),
      httpStatus,
      metaResponse: data,
      endpoint,
      mediaId,
    };
  }

  private mapMetaError(data: any, fallback: string) {
    const error = data?.error;
    const code = error?.code;
    const type = String(error?.type ?? '');
    const message = String(error?.message ?? '');
    const details = String(error?.error_data?.details ?? '');
    const combined = `${message} ${details}`.toLowerCase();

    if (code === 190 || type === 'OAuthException' || combined.includes('authentication') || combined.includes('oauth')) {
      return 'Token invalido o vencido. Genera un nuevo token en Meta Developer y reinicia el backend.';
    }

    if (
      code === 132001
      || code === 132012
      || combined.includes('template')
      || combined.includes('does not exist')
      || combined.includes('namespace')
      || combined.includes('language')
    ) {
      return fallback;
    }

    if (combined.includes('recipient') || combined.includes('phone') || combined.includes('number') || combined.includes('not a valid')) {
      return 'Numero de WhatsApp invalido o no autorizado para pruebas.';
    }

    return fallback || 'Meta WhatsApp rechazo la solicitud.';
  }

  private templateFallback(templateName: string, languageCode: string) {
    return `La plantilla ${templateName} no existe o no esta aprobada para el idioma ${languageCode}.`;
  }

  private logRequest(type: string, phone: string, endpoint: string, extra?: { templateName?: string; languageCode?: string; document?: boolean }) {
    this.logger.log(
      `[WhatsApp] mode=real strategy=${type} phone=${phone} endpoint=${endpoint} template=${extra?.templateName ?? 'none'} language=${extra?.languageCode ?? 'none'} document=${extra?.document ?? false}`,
    );
  }

  private logResponse(type: string, httpStatus: number, data: any) {
    const providerMessageId = data?.messages?.[0]?.id;
    if (data?.error) {
      this.logger.error(
        `[WhatsAppError] strategy=${type} status=${httpStatus} code=${data.error.code ?? 'none'} type=${data.error.type ?? 'none'} message=${data.error.message ?? 'none'} fbtrace_id=${data.error.fbtrace_id ?? 'none'}`,
      );
      return;
    }

    this.logger.log(
      `[WhatsApp] strategy=${type} httpStatus=${httpStatus} providerMessageId=${providerMessageId ?? 'none'} mediaId=${data?.id ?? 'none'}`,
    );
  }
}
