export interface WhatsappResponse {
  status: 'MOCK_SENT' | 'SENT' | 'ERROR';
  providerMessageId?: string;
  mediaId?: string;
  errorMessage?: string;
  mode: 'mock' | 'real';
  httpStatus?: number;
  metaResponse?: unknown;
  endpoint?: string;
}
