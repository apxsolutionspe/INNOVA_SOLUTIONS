import { Download, FileSpreadsheet, Printer, RefreshCw } from 'lucide-react';

import { Button } from '../../../components/ui';

interface ReportsHeaderProps {
  updatedAt: Date;
  isLoading: boolean;
  isExporting: boolean;
  onRefresh: () => void;
  onExportSalesPdf: () => void;
  onExportCashExcel: () => void;
  onPrint: () => void;
}

export function ReportsHeader({
  updatedAt,
  isLoading,
  isExporting,
  onRefresh,
  onExportSalesPdf,
  onExportCashExcel,
  onPrint,
}: ReportsHeaderProps) {
  return (
    <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide text-brand-blue">Panel gerencial</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Reportes</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Indicadores consolidados, alertas operativas y exportaciones para la toma de decisiones.
          </p>
          <p className="mt-3 text-xs font-bold text-slate-400">
            Actualizado: {updatedAt.toLocaleDateString('es-PE')} {updatedAt.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
            Actualizar
          </Button>
          <Button type="button" variant="secondary" onClick={onExportSalesPdf} disabled={isExporting}>
            <Download size={17} />
            PDF ventas
          </Button>
          <Button type="button" variant="secondary" onClick={onPrint} disabled={isLoading}>
            <Printer size={17} />
            Imprimir reporte
          </Button>
          <Button type="button" onClick={onExportCashExcel} disabled={isExporting}>
            <FileSpreadsheet size={17} />
            Excel caja
          </Button>
        </div>
      </div>
    </header>
  );
}
