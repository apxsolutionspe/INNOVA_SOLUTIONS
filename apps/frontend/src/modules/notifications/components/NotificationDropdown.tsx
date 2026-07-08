import { NotificationList } from './NotificationList';
import { Notification } from '../types/notification.types';

export function NotificationDropdown({ items, onRead, onReadAll }: { items: Notification[]; onRead: (id: string) => void; onReadAll: () => void }) {
  return (
    <div className="absolute right-0 top-14 z-[70] w-80 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-cyan-50/50 p-3">
        <div>
          <p className="text-sm font-black text-slate-900">Notificaciones</p>
          <p className="text-xs font-semibold text-slate-500">{items.length} registros recientes</p>
        </div>
        <button onClick={onReadAll} className="rounded-full px-2.5 py-1 text-xs font-black text-brand-blue transition hover:bg-white hover:shadow-sm">Leer todas</button>
      </div>
      <NotificationList items={items} onRead={onRead} />
    </div>
  );
}
