import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationMode, IntegrationProvider, IntegrationStatus } from '@prisma/client';
import { BaseIntegrationProvider } from './base-integration.provider';

@Injectable()
export class AiIntegrationProvider extends BaseIntegrationProvider {
  provider = IntegrationProvider.AI;
  name = 'IA Analytics';
  description = 'Analisis gerencial con reglas internas o proveedor IA configurado.';

  constructor(config: ConfigService) {
    super(config);
  }

  currentMode() {
    return this.modeFromEnv('AI_MODE');
  }

  publicConfig() {
    return {
      provider: this.env('AI_PROVIDER') ?? 'openai',
      model: this.env('AI_MODEL') ?? null,
      apiKeyConfigured: Boolean(this.env('AI_API_KEY')),
    };
  }

  async test() {
    const mode = this.currentMode();
    if (mode === IntegrationMode.MOCK) return this.mockResult('Modo mock activo. Se usan reglas internas sin enviar datos a IA externa.');
    const configured = Boolean(this.env('AI_API_KEY'));
    return { provider: this.provider, mode, status: configured ? IntegrationStatus.CONFIGURED : IntegrationStatus.ERROR, message: configured ? 'Proveedor IA configurado. Enviar solo datos resumidos.' : 'Falta AI_API_KEY.' };
  }
}
