import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationsService } from '../services/notifications.service';
import { Notification } from '../types/notification.types';

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [count, setCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const isLoadingRef = useRef(false);

  const load = useCallback(async () => {
    if (isLoadingRef.current || document.hidden) return;
    isLoadingRef.current = true;
    try {
      const [notifications, unread] = await Promise.all([notificationsService.findAll(), notificationsService.unreadCount()]);
      setItems(notifications);
      setCount(unread);
    } catch {
      setItems([]);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 30000);
    const onVisibilityChange = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [load]);

  const markRead = async (id: string) => { await notificationsService.markRead(id); await load(); };
  const readAll = async () => { await notificationsService.readAll(); await load(); };
  return { items, count, isOpen, setIsOpen, load, markRead, readAll };
}
