import { Search } from 'lucide-react';

interface ProductSearchProps {
  search: string;
  onChange: (value: string) => void;
  resultCount?: number;
  isLoading?: boolean;
}

export function ProductSearch({ search, onChange, resultCount = 0, isLoading = false }: ProductSearchProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <label className="relative block min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Buscar por nombre, SKU o codigo"
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 sm:justify-end">
          <span className="rounded-full bg-slate-100 px-2.5 py-1">
            {isLoading ? 'Actualizando catalogo...' : `${resultCount} productos`}
          </span>
          <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700">Inventario conectado</span>
        </div>
      </div>
    </div>
  );
}
