import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { CashReport } from '../types/report.types';
import { formatCurrency } from '../utils/report-formatters';
import { formatStatusLabel } from '../../../utils/display-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportDataTable } from './ReportDataTable';
import { ReportChartCard } from './ReportChartCard';
import { ReportMetricCard } from './ReportMetricCard';

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
          <ReportMetricCard label="Ingresos" value={formatCurrency(report?.income ?? 0)} />
          <ReportMetricCard label="Gastos" value={formatCurrency(report?.expenses ?? 0)} />
          <ReportMetricCard label="Diferencia" value={formatCurrency(report?.cashDifference ?? 0)} />
          <ReportMetricCard label="Cajas cerradas" value={report?.closedSessions ?? 0} />
        </div>
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Caja', 'Usuario', 'Estado', 'Diferencia']}
          rows={(report?.dailyClosing ?? []).map((row) => [row.code, row.user, formatStatusLabel(row.status), formatCurrency(row.difference)])}
        />
      </div>
    </ReportChartCard>
  );
}
