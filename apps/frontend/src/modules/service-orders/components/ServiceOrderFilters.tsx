import { RotateCcw, Search, X } from 'lucide-react';

import { Button } from '../../../components/ui';
import { ServiceOrderStatus } from '../types/service-order.types';

const statuses: Array<{ value: ServiceOrderStatus; label: string }> = [
  { value: 'RECEIVED', label: 'Recibido' },
  { value: 'DIAGNOSIS', label: 'En diagnóstico' },
  { value: 'IN_PROGRESS', label: 'En proceso' },
  { value: 'READY', label: 'Listo' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export function ServiceOrderFilters({ search, status, onSearch, onStatus, onRefresh }: {
  search: string;
  status: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onRefresh: () => void;
}) {
  const hasFilters = Boolean(search.trim() || status);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Buscar por código, cliente, equipo, marca o serie"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <select value={status} onChange={(event) => onStatus(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-100">
          <option value="">Todos los estados</option>
          {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <Button type="button" variant="secondary" onClick={() => { onSearch(''); onStatus(''); }} disabled={!hasFilters}>
          <X size={16} />
          Limpiar
        </Button>
        <Button type="button" variant="secondary" onClick={onRefresh}>
          <RotateCcw size={16} />
          Actualizar
        </Button>
      </div>
    </section>
  );
}


