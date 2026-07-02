import { AlertTriangle, Boxes, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ReportsSummary } from '../types/report.types';

const alertStyles = {
  red: 'border-red-100 bg-red-50 text-red-700',
  orange: 'border-orange-100 bg-orange-50 text-orange-700',
  blue: 'border-blue-100 bg-blue-50 text-blue-700',
  green: 'border-emerald-100 bg-emerald-50 text-emerald-700',
};

interface ReportAlertItemProps {
  label: string;
  description: string;
  value: number;
  path: string;
  tone: keyof typeof alertStyles;
  icon: typeof AlertTriangle;
}

function ReportAlertItem({ label, description, value, path, tone, icon: Icon }: ReportAlertItemProps) {
  return (
    <Link
      to={path}
      className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-brand-blue hover:shadow-sm"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${alertStyles[tone]}`}>
          <Icon size={18} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-slate-800">{label}</span>
          <span className="block truncate text-xs font-semibold text-slate-500">{description}</span>
        </span>
      </span>
      <span className={`rounded-full border px-3 py-1 text-xs font-black ${alertStyles[tone]}`}>{value}</span>
    </Link>
  );
}

export function ReportsAlertsPanel({ summary }: { summary: ReportsSummary | null }) {
  const alerts = [
    {
      label: 'Stock critico',
      description: 'Productos por reponer',
      value: summary?.productsLowStock ?? 0,
      path: '/inventory',
      tone: 'red' as const,
      icon: Boxes,
    },
    {
      label: 'Ordenes pendientes',
      description: 'Atencion tecnica en curso',
      value: summary?.pendingServiceOrders ?? 0,
      path: '/service-orders',
      tone: 'blue' as const,
      icon: AlertTriangle,
    },
    {
      label: 'Compras pendientes',
      description: 'Abastecimiento sin cerrar',
      value: summary?.pendingPurchases ?? 0,
      path: '/purchases',
      tone: 'orange' as const,
      icon: ShoppingBag,
    },
  ];
  const total = alerts.reduce((sum, alert) => sum + alert.value, 0);

  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-950">Atencion inmediata</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Pendientes que requieren seguimiento operativo.</p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${total ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {total ? <AlertTriangle size={19} /> : <CheckCircle2 size={19} />}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <ReportAlertItem key={alert.label} {...alert} />
        ))}
      </div>

      <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-500">
        {total ? `${total} pendientes consolidados.` : 'Sin pendientes criticos registrados.'}
      </p>
    </aside>
  );
}
