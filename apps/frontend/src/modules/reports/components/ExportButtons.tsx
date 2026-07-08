import { Download } from 'lucide-react';

import { ExportReportModule } from '../types/report.types';

interface Props<TModule extends ExportReportModule = ExportReportModule> {
  module: TModule;
  isExporting: boolean;
  onExport: (module: TModule, type: 'pdf' | 'excel') => void;
}

export function ExportButtons<TModule extends ExportReportModule>({ module, isExporting, onExport }: Props<TModule>) {
  return (
    <div className="flex flex-wrap gap-2">
      <button disabled={isExporting} onClick={() => onExport(module, 'pdf')} className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"><Download size={15} /> Exportar PDF</button>
      <button disabled={isExporting} onClick={() => onExport(module, 'excel')} className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"><Download size={15} /> Exportar Excel</button>
    </div>
  );
}
