import { PaymentResponse } from './payment-response.interface';

export interface PaymentProviderAdapter {
  createLink(amount: number, description: string): Promise<PaymentResponse>;
  createCharge(amount: number, token: string, description?: string): Promise<PaymentResponse>;
  testConnection(): Promise<PaymentResponse>;
}
