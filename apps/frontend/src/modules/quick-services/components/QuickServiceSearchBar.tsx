import { Search } from 'lucide-react';

interface QuickServiceSearchBarProps {
  search: string;
  resultCount: number;
  onChange: (value: string) => void;
}

export function QuickServiceSearchBar({ search, resultCount, onChange }: QuickServiceSearchBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar servicio por nombre"
          className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
        />
      </label>
      <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{resultCount} servicios disponibles</span>
        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-brand-violet">Operación rápida</span>
      </div>
    </div>
  );
}

