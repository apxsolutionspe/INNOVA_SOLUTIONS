import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { QuickServicesReport } from '../types/report.types';
import { formatCurrency } from '../utils/report-formatters';
import { ReportDataTable } from './ReportDataTable';
import { ReportChartCard } from './ReportChartCard';
import { ReportMetricCard } from './ReportMetricCard';

export function QuickServicesReportSection({ report }: { report: QuickServicesReport | null }) {
  return (
    <ReportChartCard title="Servicios rapidos">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={report?.topQuickServices ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="quantity" fill="#7c3aed" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ReportMetricCard label="Operaciones" value={report?.totalQuickServices ?? 0} />
          <ReportMetricCard label="Ingresos" value={formatCurrency(report?.quickServicesIncome ?? 0)} />
          <ReportMetricCard label="Canceladas" value={report?.cancelledOperations ?? 0} />
          <ReportMetricCard label="Categorías" value={report?.incomeByCategory.length ?? 0} />
        </div>
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Servicio', 'Cantidad', 'Ingreso']}
          rows={(report?.topQuickServices ?? []).map((row) => [row.name, row.quantity ?? 0, formatCurrency(row.amount)])}
        />
      </div>
    </ReportChartCard>
  );
}

