import { httpClient } from '../../../services/http-client';
import { Notification } from '../types/notification.types';

export const notificationsService = {
  async findAll() {
    const { data } = await httpClient.get<{ items: Notification[] }>('/notifications', { params: { limit: 10 } });
    return data.items;
  },
  async unreadCount() {
    const { data } = await httpClient.get<{ count: number }>('/notifications/unread-count');
    return data.count;
  },
  markRead(id: string) {
    return httpClient.patch(`/notifications/${id}/read`);
  },
  readAll() {
    return httpClient.patch('/notifications/read-all');
  },
};
