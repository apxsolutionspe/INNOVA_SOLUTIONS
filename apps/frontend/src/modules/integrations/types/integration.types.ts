export type IntegrationProvider = 'SUNAT' | 'WHATSAPP' | 'CULQI' | 'IZIPAY' | 'AI' | 'ECOMMERCE';
export type IntegrationMode = 'MOCK' | 'SANDBOX' | 'PRODUCTION';
export type IntegrationStatus = 'NOT_CONFIGURED' | 'CONFIGURED' | 'CONNECTED' | 'ERROR' | 'MOCK';

export interface IntegrationItem {
  provider: IntegrationProvider;
  name: string;
  description: string;
  mode: IntegrationMode;
  status: IntegrationStatus;
  isEnabled: boolean;
  publicConfig: Record<string, unknown>;
  lastTestAt: string | null;
  lastTestStatus: string | null;
  lastError: string | null;
}

export interface IntegrationTestResult {
  provider: IntegrationProvider;
  mode: IntegrationMode;
  status: IntegrationStatus;
  message: string;
}
