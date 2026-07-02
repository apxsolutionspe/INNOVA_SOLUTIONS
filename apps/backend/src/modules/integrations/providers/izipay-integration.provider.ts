import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationMode, IntegrationProvider, IntegrationStatus } from '@prisma/client';
import { BaseIntegrationProvider } from './base-integration.provider';

@Injectable()
export class IzipayIntegrationProvider extends BaseIntegrationProvider {
  provider = IntegrationProvider.IZIPAY;
  name = 'Izipay';
  description = 'Formulario, token y webhooks de pago online.';

  constructor(config: ConfigService) {
    super(config);
  }

  currentMode() {
    return this.modeFromEnv('IZIPAY_MODE');
  }

  publicConfig() {
    return {
      apiUrl: this.env('IZIPAY_API_URL') ?? null,
      username: this.mask(this.env('IZIPAY_USERNAME')),
      publicKey: this.mask(this.env('IZIPAY_PUBLIC_KEY')),
      shopId: this.mask(this.env('IZIPAY_SHOP_ID')),
      hashConfigured: Boolean(this.env('IZIPAY_HMACSHA256') || this.env('IZIPAY_HASH_KEY')),
    };
  }

  async test() {
    const mode = this.currentMode();
    if (mode === IntegrationMode.MOCK) return this.mockResult('Modo mock activo. Izipay no procesa pagos reales.');
    const configured = Boolean(this.env('IZIPAY_USERNAME') && this.env('IZIPAY_PASSWORD') && this.env('IZIPAY_SHOP_ID'));
    return { provider: this.provider, mode, status: configured ? IntegrationStatus.CONFIGURED : IntegrationStatus.ERROR, message: configured ? 'Variables Izipay configuradas.' : 'Faltan credenciales Izipay obligatorias.' };
  }
}
