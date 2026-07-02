import { httpClient } from '../../../services/http-client';
import { PaymentMethod, QuickService, QuickServiceCategory, QuickServiceSale } from '../types/quick-service.types';

export const quickServicesService = {
  async categories() { const { data } = await httpClient.get<QuickServiceCategory[]>('/quick-services/categories'); return data; },
  async services(params?: { search?: string; categoryId?: string }) { const { data } = await httpClient.get<QuickService[]>('/quick-services', { params }); return data; },
  async createCategory(payload: { name: string; description?: string; color?: string; icon?: string }) { const { data } = await httpClient.post<QuickServiceCategory>('/quick-services/categories', payload); return data; },
  async updateCategory(id: string, payload: Partial<{ name: string; description: string; color: string; icon: string }>) { const { data } = await httpClient.patch<QuickServiceCategory>(`/quick-services/categories/${id}`, payload); return data; },
  async deleteCategory(id: string) { const { data } = await httpClient.delete<QuickServiceCategory>(`/quick-services/categories/${id}`); return data; },
  async createService(payload: { categoryId: string; name: string; unit: string; unitPrice: number; costPrice?: number; description?: string }) { const { data } = await httpClient.post<QuickService>('/quick-services', payload); return data; },
  async updateService(id: string, payload: Partial<{ categoryId: string; name: string; unit: string; unitPrice: number; costPrice: number; description: string }>) { const { data } = await httpClient.patch<QuickService>(`/quick-services/${id}`, payload); return data; },
  async deleteService(id: string) { const { data } = await httpClient.delete<QuickService>(`/quick-services/${id}`); return data; },
  async createSale(payload: { customerId?: string; items: Array<{ quickServiceId: string; quantity: number }>; discount: number; paymentMethod: PaymentMethod; paymentReference?: string }) { const { data } = await httpClient.post<QuickServiceSale>('/quick-service-sales', payload); return data; },
  async sales() { const { data } = await httpClient.get<QuickServiceSale[]>('/quick-service-sales'); return data; },
  async cancel(id: string, reason: string) { const { data } = await httpClient.post<QuickServiceSale>(`/quick-service-sales/${id}/cancel`, { reason }); return data; },
  async receipt(id: string) { const { data } = await httpClient.get<{ sale: QuickServiceSale; html: string }>(`/quick-service-sales/${id}/receipt`); return data; },
};
