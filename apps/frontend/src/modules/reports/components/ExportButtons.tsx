import { Download } from 'lucide-react';

type ExportModule = 'sales' | 'inventory' | 'cash';

interface Props<TModule extends ExportModule = ExportModule> {
  module: TModule;
  isExporting: boolean;
  onExport: (module: TModule, type: 'pdf' | 'excel') => void;
}

export function ExportButtons<TModule extends ExportModule>({ module, isExporting, onExport }: Props<TModule>) {
  return (
    <div className="flex flex-wrap gap-2">
      <button disabled={isExporting} onClick={() => onExport(module, 'pdf')} className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"><Download size={15} /> PDF</button>
      <button disabled={isExporting} onClick={() => onExport(module, 'excel')} className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"><Download size={15} /> Excel</button>
    </div>
  );
}
