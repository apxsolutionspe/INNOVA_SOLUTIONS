import { ClipboardList, PackageCheck, Truck, Users, Zap } from 'lucide-react';
import { DashboardSummary } from '../types/dashboard.types';

export function OperationsSummary({ summary }: { summary: DashboardSummary }) {
  const items = [
    { label: 'Clientes', value: summary.customersCount, detail: 'registrados', icon: Users },
    { label: 'Productos vendidos', value: summary.productsSoldToday, detail: 'hoy', icon: PackageCheck },
    { label: 'Servicios rapidos', value: summary.quickServicesToday, detail: 'operaciones hoy', icon: Zap },
    { label: 'Ordenes en proceso', value: summary.serviceOrdersInProgress, detail: 'en taller', icon: ClipboardList },
    { label: 'Entregas', value: summary.serviceOrdersDeliveredToday, detail: 'del dia', icon: ClipboardList },
    { label: 'Proveedores', value: summary.suppliersCount, detail: 'activos', icon: Truck },
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-black text-slate-950">Operacion de hoy</h2>
        <p className="mt-1 text-sm text-slate-500">Lectura compacta de actividad operativa.</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-600 shadow-sm">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-lg font-black text-slate-950">{item.value}</p>
                <p className="text-xs font-semibold text-slate-500">{item.label} · {item.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
