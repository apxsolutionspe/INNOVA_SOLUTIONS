import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { InventoryReport } from '../types/report.types';
import { formatCurrency } from '../utils/report-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportChartCard } from './ReportChartCard';

export function InventoryReportSection({ report, isExporting, onExport }: { report: InventoryReport | null; isExporting: boolean; onExport: (module: 'inventory', type: 'pdf' | 'excel') => void }) {
  return (
    <ReportChartCard title="Inventario" action={<ExportButtons module="inventory" isExporting={isExporting} onExport={onExport} />}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Productos" value={report?.totalProducts ?? 0} />
          <Metric label="Activos" value={report?.activeProducts ?? 0} />
          <Metric label="Stock bajo" value={report?.lowStockProducts ?? 0} />
          <Metric label="Valor estimado" value={formatCurrency(report?.inventoryValue ?? 0)} />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={report?.topRotationProducts ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="quantity" fill="#06b6d4" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
      </div>
    </ReportChartCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}
