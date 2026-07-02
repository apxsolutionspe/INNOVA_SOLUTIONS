export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: NotificationPriority;
  isRead: boolean;
  relatedModule?: string;
  createdAt: string;
}
