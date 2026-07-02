import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CashReport } from '../types/report.types';
import { formatCurrency } from '../utils/report-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportChartCard } from './ReportChartCard';

export function CashReportSection({ report, isExporting, onExport }: { report: CashReport | null; isExporting: boolean; onExport: (module: 'cash', type: 'pdf' | 'excel') => void }) {
  const methods = [
    { name: 'Efectivo', total: report?.totalCash ?? 0 },
    { name: 'Yape', total: report?.totalYape ?? 0 },
    { name: 'Plin', total: report?.totalPlin ?? 0 },
    { name: 'Transferencia', total: report?.totalTransfer ?? 0 },
  ];
  return (
    <ReportChartCard title="Caja" action={<ExportButtons module="cash" isExporting={isExporting} onExport={onExport} />}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={methods}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="total" fill="#0ea5e9" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Ingresos" value={formatCurrency(report?.income ?? 0)} />
          <Metric label="Gastos" value={formatCurrency(report?.expenses ?? 0)} />
          <Metric label="Diferencia" value={formatCurrency(report?.cashDifference ?? 0)} />
          <Metric label="Cajas cerradas" value={report?.closedSessions ?? 0} />
        </div>
      </div>
    </ReportChartCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}
