import { httpClient } from '../../../services/http-client';
import { Supplier, SupplierPayload, SuppliersResponse } from '../types/supplier.types';

export const suppliersService = {
  async findAll(params: { search?: string; page?: number; limit?: number; isActive?: boolean }) {
    const { data } = await httpClient.get<SuppliersResponse>('/suppliers', { params });
    return data;
  },

  async findOne(id: string) {
    const { data } = await httpClient.get<Supplier>(`/suppliers/${id}`);
    return data;
  },

  async create(payload: SupplierPayload) {
    const { data } = await httpClient.post<Supplier>('/suppliers', payload);
    return data;
  },

  async update(id: string, payload: Partial<SupplierPayload>) {
    const { data } = await httpClient.patch<Supplier>(`/suppliers/${id}`, payload);
    return data;
  },

  async deactivate(id: string) {
    const { data } = await httpClient.delete<Supplier>(`/suppliers/${id}`);
    return data;
  },
};
