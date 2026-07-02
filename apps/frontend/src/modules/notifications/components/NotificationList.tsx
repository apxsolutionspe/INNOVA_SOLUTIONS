import { NotificationBadge } from './NotificationBadge';
import { Notification } from '../types/notification.types';

export function NotificationList({ items, onRead }: { items: Notification[]; onRead: (id: string) => void }) {
  if (!items.length) return <div className="p-4 text-sm font-semibold text-slate-500">Sin notificaciones.</div>;
  return (
    <div className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
      {items.map((item) => (
        <button key={item.id} onClick={() => onRead(item.id)} className="block w-full p-4 text-left hover:bg-slate-50">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold text-slate-900">{item.title}</p>
            <NotificationBadge priority={item.priority} />
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{item.message}</p>
        </button>
      ))}
    </div>
  );
}
