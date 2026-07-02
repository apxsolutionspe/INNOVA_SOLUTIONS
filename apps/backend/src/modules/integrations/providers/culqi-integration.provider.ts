import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationMode, IntegrationProvider, IntegrationStatus } from '@prisma/client';
import { BaseIntegrationProvider } from './base-integration.provider';

@Injectable()
export class CulqiIntegrationProvider extends BaseIntegrationProvider {
  provider = IntegrationProvider.CULQI;
  name = 'Culqi';
  description = 'Links y cargos de pago online.';

  constructor(config: ConfigService) {
    super(config);
  }

  currentMode() {
    return this.modeFromEnv('CULQI_MODE');
  }

  publicConfig() {
    return {
      apiUrl: this.env('CULQI_API_URL') ?? 'https://api.culqi.com',
      publicKey: this.mask(this.env('CULQI_PUBLIC_KEY')),
      privateKeyConfigured: Boolean(this.env('CULQI_PRIVATE_KEY')),
    };
  }

  async test() {
    const mode = this.currentMode();
    if (mode === IntegrationMode.MOCK) return this.mockResult('Modo mock activo. Los links de Culqi son simulados.');
    const configured = Boolean(this.env('CULQI_PRIVATE_KEY'));
    return { provider: this.provider, mode, status: configured ? IntegrationStatus.CONFIGURED : IntegrationStatus.ERROR, message: configured ? 'Credencial privada Culqi configurada.' : 'Falta CULQI_PRIVATE_KEY.' };
  }
}
