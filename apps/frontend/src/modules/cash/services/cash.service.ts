import { httpClient } from '../../../services/http-client';
import { CashMovement, CashMovementType, CashSession, CashSummary, PaymentMethod } from '../types/cash.types';

export const cashService = {
  async open(payload: { openingAmount: number; notes?: string }) {
    const { data } = await httpClient.post<CashSession>('/cash/open', payload);
    return data;
  },
  async current() {
    const { data } = await httpClient.get<CashSession | null>('/cash/current');
    return data;
  },
  async sessions() {
    const { data } = await httpClient.get<CashSession[]>('/cash/sessions');
    return data;
  },
  async movements(params?: { type?: string; paymentMethod?: string }) {
    const { data } = await httpClient.get<CashMovement[]>('/cash/movements', { params });
    return data;
  },
  async createMovement(payload: { type: CashMovementType; concept: string; amount: number; paymentMethod: PaymentMethod; reference?: string; notes?: string }) {
    const { data } = await httpClient.post<CashMovement>('/cash/movements', payload);
    return data;
  },
  async close(payload: { realCashAmount: number; notes?: string }) {
    const { data } = await httpClient.post<CashSession>('/cash/close', payload);
    return data;
  },
  async summary() {
    const { data } = await httpClient.get<CashSummary>('/cash/summary');
    return data;
  },
};
