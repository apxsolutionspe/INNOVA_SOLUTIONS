import { httpClient } from '../../../services/http-client';
import { Customer, CustomerPayload, CustomerQuery, CustomersResponse } from '../types/customer.types';

export const customersService = {
  async findAll(params: CustomerQuery) {
    const { data } = await httpClient.get<CustomersResponse>('/customers', { params });
    return data;
  },

  async create(payload: CustomerPayload) {
    const { data } = await httpClient.post<Customer>('/customers', payload);
    return data;
  },

  async update(id: string, payload: Partial<CustomerPayload>) {
    const { data } = await httpClient.patch<Customer>(`/customers/${id}`, payload);
    return data;
  },

  async deactivate(id: string) {
    const { data } = await httpClient.delete<Customer>(`/customers/${id}`);
    return data;
  },

  async setStatus(id: string, isActive: boolean) {
    const { data } = await httpClient.patch<Customer>(`/customers/${id}/status`, { isActive });
    return data;
  },
};
