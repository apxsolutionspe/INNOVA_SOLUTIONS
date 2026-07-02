import { NotificationPriority } from '../types/notification.types';

const styles: Record<NotificationPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-cyan-50 text-cyan-700',
  HIGH: 'bg-orange-50 text-orange-700',
  CRITICAL: 'bg-red-50 text-red-700',
};

export function NotificationBadge({ priority }: { priority: NotificationPriority }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${styles[priority]}`}>{priority}</span>;
}
