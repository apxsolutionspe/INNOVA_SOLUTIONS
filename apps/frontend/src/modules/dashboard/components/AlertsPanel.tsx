import { Link } from 'react-router-dom';
import { DashboardAlert } from '../types/dashboard.types';

const severityStyles: Record<DashboardAlert['severity'], string> = {
  danger: 'bg-red-50 text-red-700 ring-red-100',
  warning: 'bg-orange-50 text-orange-700 ring-orange-100',
  info: 'bg-blue-50 text-brand-blue ring-blue-100',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
};

export function AlertsPanel({ alerts }: { alerts: DashboardAlert[] }) {
  const visibleAlerts = alerts.filter((alert) => alert.isVisible).slice(0, 5);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-950">Atencion inmediata</h2>
          <p className="mt-1 text-sm text-slate-500">Pendientes que requieren seguimiento.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{visibleAlerts.length}</span>
      </div>

      <div className="mt-4 space-y-2">
        {visibleAlerts.length ? visibleAlerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <Link key={alert.label} to={alert.path} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-3 transition hover:border-brand-blue/30 hover:bg-slate-50">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${severityStyles[alert.severity]}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">{alert.label}</p>
                <p className="truncate text-xs text-slate-500">{alert.description}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">{alert.value}</span>
            </Link>
          );
        }) : (
          <div className="rounded-lg bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
            <p className="font-bold">Sin alertas criticas</p>
            <p className="mt-1 text-xs leading-5">Los indicadores principales no muestran pendientes urgentes.</p>
          </div>
        )}
      </div>
    </section>
  );
}
