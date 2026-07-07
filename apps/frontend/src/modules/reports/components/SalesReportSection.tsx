import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { SalesReport } from '../types/report.types';
import { formatCurrency, shortDate } from '../utils/report-formatters';
import { formatStatusLabel } from '../../../utils/display-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportDataTable } from './ReportDataTable';
import { ReportChartCard } from './ReportChartCard';
import { ReportMetricCard } from './ReportMetricCard';

export function SalesReportSection({ report, isExporting, onExport }: { report: SalesReport | null; isExporting: boolean; onExport: (module: 'sales', type: 'pdf' | 'excel') => void }) {
  const data = report?.salesByDate.map((item) => ({ ...item, date: shortDate(item.date) })) ?? [];
  return (
    <ReportChartCard title="Ventas" action={<ExportButtons module="sales" isExporting={isExporting} onExport={onExport} />}>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <ReportMetricCard label="Cantidad" value={report?.salesCount ?? 0} />
          <ReportMetricCard label="Total vendido" value={formatCurrency(report?.totalSold ?? 0)} />
          <ReportMetricCard label="Ticket promedio" value={formatCurrency(report?.averageTicket ?? 0)} />
          <ReportMetricCard label="Anuladas" value={report?.cancelledSales ?? 0} />
        </div>
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Código', 'Cliente', 'Usuario', 'Estado', 'Total']}
          rows={(report?.rows ?? []).slice(0, 12).map((row) => [row.code, row.customer, row.user, formatStatusLabel(row.status), formatCurrency(row.total)])}
        />
      </div>
    </ReportChartCard>
  );
}
