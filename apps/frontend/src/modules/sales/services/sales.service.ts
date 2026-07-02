import { httpClient } from '../../../services/http-client';
import { Sale, SalesResponse } from '../types/sale.types';

export const salesService = {
  async findAll(params: { search?: string; status?: string; page?: number; limit?: number }) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    );
    const { data } = await httpClient.get<SalesResponse>('/sales', { params: cleanParams });
    return data;
  },

  async findOne(id: string) {
    const { data } = await httpClient.get<Sale>(`/sales/${id}`);
    return data;
  },

  async cancel(id: string, reason: string) {
    const { data } = await httpClient.post<Sale>(`/sales/${id}/cancel`, { reason });
    return data;
  },

  async receipt(id: string) {
    const { data } = await httpClient.get<{ sale: Sale; html: string }>(`/sales/${id}/receipt`);
    return data;
  },
};
