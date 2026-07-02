import { ClipboardPlus, CreditCard, FileText, ShoppingBag, ShoppingCart, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuickAction } from '../types/dashboard.types';

const actions: QuickAction[] = [
  { label: 'Nueva venta', description: 'Abrir POS', path: '/pos', icon: ShoppingCart },
  { label: 'Nuevo cliente', description: 'Gestionar clientes', path: '/customers', icon: UserPlus },
  { label: 'Nueva orden tecnica', description: 'Recepcion de equipo', path: '/service-orders', icon: ClipboardPlus },
  { label: 'Abrir caja', description: 'Control diario', path: '/cash', icon: CreditCard },
  { label: 'Registrar compra', description: 'Abastecimiento', path: '/purchases', icon: ShoppingBag },
  { label: 'Ver reportes', description: 'Analisis completo', path: '/reports', icon: FileText },
];

export function QuickActionsPanel() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-black text-slate-950">Accesos rapidos</h2>
        <p className="mt-1 text-sm text-slate-500">Acciones frecuentes para operar sin friccion.</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.path} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-3 transition hover:border-brand-blue/30 hover:bg-blue-50/40">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{action.label}</p>
                <p className="truncate text-xs text-slate-500">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
