import { ConfigService } from '@nestjs/config';
import { IntegrationMode, IntegrationProvider, IntegrationStatus } from '@prisma/client';
import { IntegrationProviderAdapter, IntegrationTestResult } from '../interfaces/integration-provider.interface';

export abstract class BaseIntegrationProvider implements IntegrationProviderAdapter {
  abstract provider: IntegrationProvider;
  abstract name: string;
  abstract description: string;

  constructor(protected readonly config: ConfigService) {}

  protected env(key: string) {
    return this.config.get<string>(key);
  }

  protected modeFromEnv(key: string): IntegrationMode {
    const value = (this.env(key) ?? 'mock').toUpperCase();
    if (value === 'PRODUCTION') return IntegrationMode.PRODUCTION;
    if (value === 'SANDBOX') return IntegrationMode.SANDBOX;
    return IntegrationMode.MOCK;
  }

  protected mask(value?: string | null) {
    if (!value) return null;
    return value.length <= 4 ? '****' : `${'*'.repeat(Math.max(value.length - 4, 4))}${value.slice(-4)}`;
  }

  protected mockResult(message = 'Modo mock activo'): IntegrationTestResult {
    return { provider: this.provider, mode: IntegrationMode.MOCK, status: IntegrationStatus.MOCK, message };
  }

  abstract currentMode(): IntegrationMode;
  abstract publicConfig(): Record<string, unknown>;
  abstract test(): Promise<IntegrationTestResult>;
}
