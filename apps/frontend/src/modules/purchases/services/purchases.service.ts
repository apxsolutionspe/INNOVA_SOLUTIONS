import { httpClient } from '../../../services/http-client';
import { PurchaseOrder, PurchasePayload, PurchasesResponse } from '../types/purchase.types';

export const purchasesService = {
  async findAll(params: { search?: string; status?: string; page?: number; limit?: number }) {
    const { data } = await httpClient.get<PurchasesResponse>('/purchases', { params });
    return data;
  },

  async findOne(id: string) {
    const { data } = await httpClient.get<PurchaseOrder>(`/purchases/${id}`);
    return data;
  },

  async create(payload: PurchasePayload) {
    const { data } = await httpClient.post<PurchaseOrder>('/purchases', payload);
    return data;
  },

  async update(id: string, payload: Partial<PurchasePayload>) {
    const { data } = await httpClient.patch<PurchaseOrder>(`/purchases/${id}`, payload);
    return data;
  },

  async receive(id: string, payload: { items?: Array<{ itemId: string; receivedQuantity: number }>; notes?: string }) {
    const { data } = await httpClient.post<PurchaseOrder>(`/purchases/${id}/receive`, payload);
    return data;
  },

  async cancel(id: string, reason: string) {
    const { data } = await httpClient.post<PurchaseOrder>(`/purchases/${id}/cancel`, { reason });
    return data;
  },

  async receipt(id: string) {
    const { data } = await httpClient.get<{ purchase: PurchaseOrder; html: string }>(`/purchases/${id}/receipt`);
    return data;
  },
};
