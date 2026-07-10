import { httpClient } from '../../../services/http-client';
import { Supplier, SupplierPayload, SupplierProduct, SupplierProductPayload, SuppliersResponse } from '../types/supplier.types';

function cleanPayload<T extends object>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>;
}

export const suppliersService = {
  async findAll(params: { search?: string; page?: number; limit?: number; isActive?: boolean }) {
    const { data } = await httpClient.get<SuppliersResponse>('/suppliers', { params });
    return data;
  },

  async findOne(id: string) {
    const { data } = await httpClient.get<Supplier>(`/suppliers/${id}`);
    return data;
  },

  async products(id: string) {
    const { data } = await httpClient.get<SupplierProduct[]>(`/suppliers/${id}/products`);
    return data;
  },

  async create(payload: SupplierPayload) {
    const { data } = await httpClient.post<Supplier>('/suppliers', cleanPayload(payload));
    return data;
  },

  async update(id: string, payload: Partial<SupplierPayload>) {
    const { data } = await httpClient.patch<Supplier>(`/suppliers/${id}`, cleanPayload(payload));
    return data;
  },

  async addProduct(id: string, payload: SupplierProductPayload) {
    const { data } = await httpClient.post<Supplier>(`/suppliers/${id}/products`, cleanPayload(payload));
    return data;
  },

  async updateProduct(id: string, itemId: string, payload: SupplierProductPayload) {
    const { data } = await httpClient.patch<Supplier>(`/suppliers/${id}/products/${itemId}`, cleanPayload(payload));
    return data;
  },

  async deactivateProduct(id: string, itemId: string) {
    const { data } = await httpClient.delete<Supplier>(`/suppliers/${id}/products/${itemId}`);
    return data;
  },

  async deactivate(id: string) {
    const { data } = await httpClient.delete<Supplier>(`/suppliers/${id}`);
    return data;
  },
};
