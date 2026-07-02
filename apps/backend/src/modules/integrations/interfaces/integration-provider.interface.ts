import { IntegrationMode, IntegrationProvider, IntegrationStatus } from '@prisma/client';

export interface IntegrationTestResult {
  provider: IntegrationProvider;
  mode: IntegrationMode;
  status: IntegrationStatus;
  message: string;
  details?: Record<string, unknown>;
}

export interface IntegrationProviderAdapter {
  provider: IntegrationProvider;
  name: string;
  description: string;
  currentMode(): IntegrationMode;
  publicConfig(): Record<string, unknown>;
  test(): Promise<IntegrationTestResult>;
}
