import { httpClient } from '../../../services/http-client';

export interface PaymentTransaction {
  id: string;
  provider: string;
  amount: string | number;
  currency: string;
  status: string;
  paymentLink?: string | null;
  createdAt: string;
}

export const paymentsService = {
  async createLink(payload: { amount: number; description: string; provider?: 'culqi' | 'izipay' }) {
    const { data } = await httpClient.post<PaymentTransaction>('/payments/create-link', payload);
    return data;
  },
  async transactions() {
    const { data } = await httpClient.get<PaymentTransaction[]>('/payments/transactions');
    return data;
  },
  async testConnection() {
    const { data } = await httpClient.post('/payments/test-connection');
    return data;
  },
};
