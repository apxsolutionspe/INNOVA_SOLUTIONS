import { IntegrationMode, IntegrationProvider, IntegrationStatus } from '@prisma/client';

export interface IntegrationStatusView {
  provider: IntegrationProvider;
  name: string;
  description: string;
  mode: IntegrationMode;
  status: IntegrationStatus;
  isEnabled: boolean;
  publicConfig: Record<string, unknown>;
  lastTestAt: Date | null;
  lastTestStatus: string | null;
  lastError: string | null;
}
