import { Search, SlidersHorizontal } from 'lucide-react';

interface CashFiltersProps {
  type: string;
  paymentMethod: string;
  search: string;
  onTypeChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function CashFilters({ type, paymentMethod, search, onTypeChange, onPaymentMethodChange, onSearchChange }: CashFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-950">
        <SlidersHorizontal size={17} />
        Filtros de movimientos
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_13rem_13rem]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por concepto o referencia"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>
        <select
          value={type}
          onChange={(event) => onTypeChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
        >
          <option value="">Todos los tipos</option>
          <option value="INCOME">Ingresos</option>
          <option value="EXPENSE">Gastos / egresos</option>
          <option value="SALE">Ventas POS</option>
          <option value="SERVICE_PAYMENT">Servicios rápidos</option>
          <option value="ADJUSTMENT">Ajustes</option>
        </select>
        <select
          value={paymentMethod}
          onChange={(event) => onPaymentMethodChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
        >
          <option value="">Todos los métodos</option>
          <option value="CASH">Efectivo</option>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
          <option value="TRANSFER">Transferencia</option>
        </select>
      </div>
    </section>
  );
}
