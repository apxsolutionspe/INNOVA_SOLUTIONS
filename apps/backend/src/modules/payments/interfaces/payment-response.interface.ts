import { PaymentProvider, PaymentTransactionStatus } from '@prisma/client';

export interface PaymentResponse {
  provider: PaymentProvider;
  status: PaymentTransactionStatus;
  paymentLink?: string;
  providerTransactionId?: string;
  providerResponse?: Record<string, unknown>;
  errorMessage?: string;
  mode: 'mock' | 'prepared';
}
