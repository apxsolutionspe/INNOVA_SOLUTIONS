import { ServiceOrderLog } from '../types/service-order.types';
import { serviceOrderStatusLabels } from '../utils/service-order-status';

export function ServiceOrderTimeline({ logs }: { logs: ServiceOrderLog[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Bitacora</h2>
      <div className="mt-4 space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="border-l-2 border-brand-cyan pl-4">
            <p className="text-sm font-bold text-slate-800">{log.action}</p>
            <p className="text-xs text-slate-500">
              {log.previousStatus ? serviceOrderStatusLabels[log.previousStatus] : ''} {log.newStatus ? `-> ${serviceOrderStatusLabels[log.newStatus]}` : ''}
            </p>
            <p className="text-sm text-slate-600">{log.comment ?? '-'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
