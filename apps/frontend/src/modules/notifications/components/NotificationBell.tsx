import { Bell } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationBell() {
  const notifications = useNotifications();
  return (
    <div className="relative">
      <button
        onClick={() => notifications.setIsOpen(!notifications.isOpen)}
        className={`group relative grid h-11 w-11 place-items-center rounded-2xl border bg-white/85 text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-cyan hover:bg-cyan-50/70 hover:text-brand-blue hover:shadow-cyan-100/70 focus:outline-none focus:ring-4 focus:ring-cyan-100 ${
          notifications.isOpen ? 'border-brand-cyan text-brand-blue ring-1 ring-cyan-100' : 'border-slate-200/80'
        }`}
        title="Notificaciones"
      >
        <Bell size={18} className="transition group-hover:rotate-6 group-hover:scale-105" />
        {notifications.count ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-red-500 to-rose-600 px-1 text-[10px] font-black text-white shadow-sm">
            {notifications.count}
          </span>
        ) : null}
      </button>
      {notifications.isOpen ? <NotificationDropdown items={notifications.items} onRead={(id) => void notifications.markRead(id)} onReadAll={() => void notifications.readAll()} /> : null}
    </div>
  );
}
