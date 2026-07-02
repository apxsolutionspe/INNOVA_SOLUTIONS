import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationMode, IntegrationProvider, IntegrationStatus } from '@prisma/client';
import { BaseIntegrationProvider } from './base-integration.provider';

@Injectable()
export class WhatsappIntegrationProvider extends BaseIntegrationProvider {
  provider = IntegrationProvider.WHATSAPP;
  name = 'WhatsApp Cloud API';
  description = 'Envio de mensajes, comprobantes y avisos al cliente desde backend.';

  constructor(config: ConfigService) {
    super(config);
  }

  currentMode() {
    return this.modeFromEnv('WHATSAPP_MODE');
  }

  publicConfig() {
    return {
      apiUrl: this.env('WHATSAPP_API_URL') ?? 'https://graph.facebook.com',
      apiVersion: this.env('WHATSAPP_API_VERSION') ?? 'v20.0',
      phoneNumberId: this.mask(this.env('WHATSAPP_PHONE_NUMBER_ID')),
      businessAccountId: this.mask(this.env('WHATSAPP_BUSINESS_ACCOUNT_ID')),
      accessTokenConfigured: Boolean(this.env('WHATSAPP_ACCESS_TOKEN')),
    };
  }

  async test() {
    const mode = this.currentMode();
    if (mode === IntegrationMode.MOCK) return this.mockResult('Modo mock activo. Los mensajes se registran sin enviarse a Meta.');
    const configured = Boolean(this.env('WHATSAPP_ACCESS_TOKEN') && this.env('WHATSAPP_PHONE_NUMBER_ID'));
    return {
      provider: this.provider,
      mode,
      status: configured ? IntegrationStatus.CONFIGURED : IntegrationStatus.ERROR,
      message: configured ? 'Credenciales WhatsApp disponibles. Envio real habilitado por provider.' : 'Faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID.',
    };
  }
}
