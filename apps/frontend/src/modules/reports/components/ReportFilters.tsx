import { Filter, RotateCcw, X } from 'lucide-react';
import { Button } from '../../../components/ui';
import { ReportFilters as Filters } from '../types/report.types';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onRefresh: () => void;
}

export function ReportFilters({ filters, onChange, onRefresh }: Props) {
  const hasFilters = Boolean(
    filters.startDate ||
    filters.endDate ||
    filters.paymentMethod ||
    filters.status ||
    filters.categoryId ||
    filters.productId ||
    filters.supplierId,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-black text-slate-800">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brand-blue">
            <Filter size={17} />
          </span>
          Filtros del reporte
        </div>
        <p className="text-xs font-semibold text-slate-400">Define el periodo y genera el reporte con datos reales.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[160px_160px_180px_170px_1fr_auto_auto] xl:items-center">
        <input
          type="date"
          value={filters.startDate ?? ''}
          onChange={(event) => onChange({ ...filters, startDate: event.target.value || undefined })}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
        <input
          type="date"
          value={filters.endDate ?? ''}
          onChange={(event) => onChange({ ...filters, endDate: event.target.value || undefined })}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
        <select
          value={filters.paymentMethod ?? ''}
          onChange={(event) => onChange({ ...filters, paymentMethod: event.target.value || undefined })}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-100"
        >
          <option value="">Todos los metodos</option>
          <option value="CASH">Efectivo</option>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
          <option value="TRANSFER">Transferencia</option>
        </select>
        <input
          value={filters.status ?? ''}
          onChange={(event) => onChange({ ...filters, status: event.target.value || undefined })}
          placeholder="Estado opcional"
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
        <input
          value={filters.categoryId ?? ''}
          onChange={(event) => onChange({ ...filters, categoryId: event.target.value || undefined })}
          placeholder="Categoria ID opcional"
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-100"
        />
        <Button type="button" variant="secondary" onClick={() => onChange({})} disabled={!hasFilters}>
          <X size={16} />
          Limpiar
        </Button>
        <Button type="button" onClick={onRefresh}>
          <RotateCcw size={17} />
          Generar reporte
        </Button>
      </div>
    </section>
  );
}
