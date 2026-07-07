import { httpClient } from '../../../services/http-client';
import {
  CreateServiceOrderPayload,
  ServiceOrder,
  ServiceOrderPhotoPayload,
  ServiceOrdersResponse,
  ServiceOrderStatus,
} from '../types/service-order.types';

export const serviceOrdersService = {
  async findAll(params: { search?: string; status?: string; page?: number; limit?: number }) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    );
    const { data } = await httpClient.get<ServiceOrdersResponse>('/service-orders', { params: cleanParams });
    return data;
  },

  async findOne(id: string) {
    const { data } = await httpClient.get<ServiceOrder>(`/service-orders/${id}`);
    return data;
  },

  async create(payload: CreateServiceOrderPayload) {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    );
    const { data } = await httpClient.post<ServiceOrder>('/service-orders', cleanPayload);
    return data;
  },

  async update(id: string, payload: Partial<ServiceOrder>) {
    const { data } = await httpClient.patch<ServiceOrder>(`/service-orders/${id}`, payload);
    return data;
  },

  async changeStatus(id: string, status: ServiceOrderStatus, comment?: string) {
    const { data } = await httpClient.patch<ServiceOrder>(`/service-orders/${id}/status`, { status, comment });
    return data;
  },

  async addItem(id: string, payload: { productId?: string; description: string; quantity: number; unitPrice: number }) {
    const { data } = await httpClient.post<ServiceOrder>(`/service-orders/${id}/items`, payload);
    return data;
  },

  async removeItem(id: string, itemId: string) {
    const { data } = await httpClient.delete<ServiceOrder>(`/service-orders/${id}/items/${itemId}`);
    return data;
  },

  async addPhotos(id: string, photos: ServiceOrderPhotoPayload[]) {
    const { data } = await httpClient.post<ServiceOrder>(`/service-orders/${id}/photos`, { photos });
    return data;
  },

  async deletePhoto(id: string, photoId: string) {
    const { data } = await httpClient.delete<ServiceOrder>(`/service-orders/${id}/photos/${photoId}`);
    return data;
  },

  async deliver(id: string) {
    const { data } = await httpClient.post<ServiceOrder>(`/service-orders/${id}/deliver`);
    return data;
  },

  async cancel(id: string, reason: string) {
    const { data } = await httpClient.post<ServiceOrder>(`/service-orders/${id}/cancel`, { reason });
    return data;
  },

  async receipt(id: string) {
    const { data } = await httpClient.get<{ order: ServiceOrder; html: string }>(`/service-orders/${id}/receipt`);
    return data;
  },

  async ticket(id: string) {
    const { data } = await httpClient.get<{ order: ServiceOrder; html: string }>(`/service-orders/${id}/ticket`);
    return data;
  },

  async sendWhatsApp(id: string) {
    const { data } = await httpClient.post<{
      success: boolean;
      message: string;
      mode?: string;
      status?: string;
      whatsappUrl?: string;
      receiptUrl?: string;
      providerMessageId?: string;
      manualSendRequired?: boolean;
      warning?: string;
    }>(`/service-orders/${id}/send-whatsapp`);
    return data;
  },
};
