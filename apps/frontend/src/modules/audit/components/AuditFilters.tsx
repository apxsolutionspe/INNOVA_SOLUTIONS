import { CalendarDays, Filter, RotateCcw, Search } from 'lucide-react';
import { Button } from '../../../components/ui';

type AuditFiltersValue = Record<string, string | undefined>;

export function AuditFilters({ filters, onChange }: { filters: AuditFiltersValue; onChange: (filters: AuditFiltersValue) => void }) {
  const hasFilters = Boolean(filters.module || filters.action || filters.startDate || filters.endDate);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-950">Filtros de auditoría</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Refina la trazabilidad por módulo, acción o rango de fechas.</p>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={!hasFilters} onClick={() => onChange({})} className="rounded-full">
          <RotateCcw size={15} />
          Limpiar filtros
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
          Módulo
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              placeholder="Ej. users, sales"
              value={filters.module ?? ''}
              onChange={(event) => onChange({ ...filters, module: event.target.value || undefined })}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </span>
        </label>

        <label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
          Acción
          <span className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              placeholder="Ej. LOGIN"
              value={filters.action ?? ''}
              onChange={(event) => onChange({ ...filters, action: event.target.value || undefined })}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </span>
        </label>

        <label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
          Fecha inicio
          <span className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="date"
              value={filters.startDate ?? ''}
              onChange={(event) => onChange({ ...filters, startDate: event.target.value || undefined })}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </span>
        </label>

        <label className="grid gap-1.5 text-xs font-black uppercase tracking-wide text-slate-500">
          Fecha fin
          <span className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="date"
              value={filters.endDate ?? ''}
              onChange={(event) => onChange({ ...filters, endDate: event.target.value || undefined })}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </span>
        </label>
      </div>
    </section>
  );
}
