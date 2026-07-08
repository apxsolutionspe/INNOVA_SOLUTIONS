import { Plus, Search } from 'lucide-react';

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function SupplierFilters({ search, onSearchChange, onCreate }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <label className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por proveedor, RUC, teléfono o producto"
          className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-brand-blue"
        />
      </label>
      <button type="button" onClick={onCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
        <Plus size={18} /> Nuevo proveedor
      </button>
    </div>
  );
}
