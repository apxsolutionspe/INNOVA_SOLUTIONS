import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { InventoryReport } from '../types/report.types';
import { formatCurrency } from '../utils/report-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportDataTable } from './ReportDataTable';
import { ReportChartCard } from './ReportChartCard';
import { ReportMetricCard } from './ReportMetricCard';

export function InventoryReportSection({ report, isExporting, onExport }: { report: InventoryReport | null; isExporting: boolean; onExport: (module: 'inventory', type: 'pdf' | 'excel') => void }) {
  return (
    <ReportChartCard title="Inventario" action={<ExportButtons module="inventory" isExporting={isExporting} onExport={onExport} />}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <ReportMetricCard label="Productos" value={report?.totalProducts ?? 0} />
          <ReportMetricCard label="Activos" value={report?.activeProducts ?? 0} />
          <ReportMetricCard label="Stock bajo" value={report?.lowStockProducts ?? 0} />
          <ReportMetricCard label="Valor estimado" value={formatCurrency(report?.inventoryValue ?? 0)} />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={report?.topRotationProducts ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="quantity" fill="#06b6d4" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Producto', 'SKU', 'Categoría', 'Stock', 'Venta']}
          rows={(report?.rows ?? []).slice(0, 14).map((row) => [row.name, row.sku, row.category, `${row.stock}/${row.minStock}`, formatCurrency(row.salePrice)])}
        />
      </div>
    </ReportChartCard>
  );
}

