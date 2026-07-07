import { RotateCcw, Search } from 'lucide-react';

import { Button } from '../../../components/ui';

interface SalesHistoryFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClear: () => void;
}

export function SalesHistoryFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}: SalesHistoryFiltersProps) {
  const hasFilters = Boolean(search.trim() || status);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por código o cliente"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
        >
          <option value="">Todos los estados</option>
          <option value="COMPLETED">Completadas</option>
          <option value="CANCELLED">Anuladas</option>
        </select>

        <Button type="button" variant="secondary" onClick={onClear} disabled={!hasFilters}>
          <RotateCcw size={16} />
          Limpiar
        </Button>
      </div>
    </div>
  );
}

