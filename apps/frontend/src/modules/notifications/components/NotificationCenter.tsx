import { NotificationList } from './NotificationList';
import { useNotifications } from '../hooks/useNotifications';

export function NotificationCenter() {
  const notifications = useNotifications();
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <h2 className="font-bold text-slate-950">Centro de notificaciones</h2>
        <button onClick={() => void notifications.readAll()} className="text-sm font-bold text-brand-blue">Marcar todas</button>
      </div>
      <NotificationList items={notifications.items} onRead={(id) => void notifications.markRead(id)} />
    </section>
  );
}
