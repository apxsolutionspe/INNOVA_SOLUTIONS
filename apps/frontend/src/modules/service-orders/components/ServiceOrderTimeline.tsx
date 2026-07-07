import { CheckCircle2, Clock3 } from 'lucide-react';

import { ServiceOrderLog } from '../types/service-order.types';
import { formatDateTime, formatServiceOrderAction, formatStatusTransition } from '../utils/service-order-formatters';

export function ServiceOrderTimeline({ logs }: { logs: ServiceOrderLog[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">Bitácora</h2>
          <p className="text-sm font-semibold text-slate-500">Trazabilidad de cambios y acciones realizadas.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{logs.length} evento(s)</span>
      </div>

      {logs.length ? (
        <div className="mt-5 max-h-[520px] space-y-0 overflow-y-auto pr-1">
          {logs.map((log, index) => {
            const transition = formatStatusTransition(log.previousStatus, log.newStatus);
            return (
              <article key={log.id} className="relative grid grid-cols-[32px_1fr] gap-3 pb-5">
                {index < logs.length - 1 ? <span className="absolute left-4 top-8 h-[calc(100%-1rem)] w-px bg-slate-200" /> : null}
                <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-brand-blue ring-4 ring-white">
                  {log.action === 'CHANGE_STATUS' ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                </span>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-black text-slate-900">{formatServiceOrderAction(log)}</p>
                    <p className="text-xs font-bold text-slate-500">{formatDateTime(log.createdAt)}</p>
                  </div>
                  {transition ? <p className="mt-1 text-xs font-black text-brand-blue">{transition}</p> : null}
                  <p className="mt-2 text-sm font-semibold text-slate-600">{log.comment || 'Sin comentario adicional.'}</p>
                  {log.user?.fullName ? <p className="mt-2 text-xs font-bold text-slate-400">Usuario: {log.user.fullName}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <p className="text-sm font-black text-slate-800">Aún no hay eventos registrados</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">Los cambios de estado, diagnósticos e ítems aparecerán aquí.</p>
        </div>
      )}
    </section>
  );
}
