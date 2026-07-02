import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationMode, IntegrationProvider, IntegrationStatus } from '@prisma/client';
import { BaseIntegrationProvider } from './base-integration.provider';

@Injectable()
export class SunatIntegrationProvider extends BaseIntegrationProvider {
  provider = IntegrationProvider.SUNAT;
  name = 'SUNAT';
  description = 'Emision futura de boletas, facturas y notas electronicas.';

  constructor(config: ConfigService) {
    super(config);
  }

  currentMode() {
    return this.modeFromEnv('SUNAT_MODE');
  }

  publicConfig() {
    return {
      apiUrl: this.env('SUNAT_API_URL') ?? null,
      tokenUrl: this.env('SUNAT_TOKEN_URL') ?? null,
      ruc: this.env('SUNAT_RUC') ?? null,
      clientId: this.mask(this.env('SUNAT_CLIENT_ID')),
      username: this.mask(this.env('SUNAT_USERNAME')),
      certPathConfigured: Boolean(this.env('SUNAT_CERT_PATH')),
    };
  }

  async test() {
    const mode = this.currentMode();
    if (mode === IntegrationMode.MOCK) return this.mockResult('Modo mock activo. No se envia informacion a SUNAT.');
    const configured = Boolean(this.env('SUNAT_API_URL') && this.env('SUNAT_CLIENT_ID') && this.env('SUNAT_CLIENT_SECRET') && this.env('SUNAT_RUC'));
    return {
      provider: this.provider,
      mode,
      status: configured ? IntegrationStatus.CONFIGURED : IntegrationStatus.ERROR,
      message: configured ? 'Credenciales SUNAT cargadas. Falta validacion normativa y envio CPE real.' : 'Faltan credenciales obligatorias de SUNAT.',
    };
  }
}
