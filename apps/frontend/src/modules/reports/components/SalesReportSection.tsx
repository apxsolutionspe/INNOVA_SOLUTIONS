import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { SalesReport } from '../types/report.types';
import { formatCurrency, shortDate } from '../utils/report-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportChartCard } from './ReportChartCard';

export function SalesReportSection({ report, isExporting, onExport }: { report: SalesReport | null; isExporting: boolean; onExport: (module: 'sales', type: 'pdf' | 'excel') => void }) {
  const data = report?.salesByDate.map((item) => ({ ...item, date: shortDate(item.date) })) ?? [];
  return (
    <ReportChartCard title="Ventas" action={<ExportButtons module="sales" isExporting={isExporting} onExport={onExport} />}>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
        </div>
        <div className="space-y-3 text-sm">
          <Metric label="Cantidad" value={report?.salesCount ?? 0} />
          <Metric label="Total vendido" value={formatCurrency(report?.totalSold ?? 0)} />
          <Metric label="Ticket promedio" value={formatCurrency(report?.averageTicket ?? 0)} />
          <Metric label="Anuladas" value={report?.cancelledSales ?? 0} />
        </div>
      </div>
    </ReportChartCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}
