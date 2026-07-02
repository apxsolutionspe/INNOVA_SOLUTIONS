import { CalendarRange, RotateCcw, X } from 'lucide-react';

import { Button } from '../../../components/ui';

export function ProfitabilityFilters({ filters, onChange, onRefresh }: { filters: Record<string, string | undefined>; onChange: (filters: Record<string, string | undefined>) => void; onRefresh: () => void }) {
  const hasFilters = Boolean(filters.startDate || filters.endDate);
  const dateError = filters.startDate && filters.endDate && filters.startDate > filters.endDate
    ? 'La fecha inicial no puede ser mayor que la fecha final.'
    : '';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-black text-slate-800">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brand-blue">
            <CalendarRange size={17} />
          </span>
          Filtros financieros
        </div>
        <p className="text-xs font-semibold text-slate-400">Aplica un rango para analizar utilidad y margen del periodo.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-[180px_180px_auto_auto] md:items-center">
        <input type="date" value={filters.startDate ?? ''} onChange={(event) => onChange({ ...filters, startDate: event.target.value || undefined })} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-100" />
        <input type="date" value={filters.endDate ?? ''} onChange={(event) => onChange({ ...filters, endDate: event.target.value || undefined })} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-100" />
        <Button type="button" variant="secondary" onClick={() => onChange({})} disabled={!hasFilters}>
          <X size={16} />
          Limpiar
        </Button>
        <Button type="button" onClick={onRefresh} disabled={Boolean(dateError)}>
          <RotateCcw size={16} />
          Aplicar
        </Button>
      </div>
      {dateError ? <p className="mt-2 text-xs font-bold text-red-600">{dateError}</p> : null}
    </section>
  );
}
