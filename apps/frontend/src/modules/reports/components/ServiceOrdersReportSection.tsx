import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ServiceOrdersReport } from '../types/report.types';
import { formatCurrency } from '../utils/report-formatters';
import { ReportDataTable } from './ReportDataTable';
import { ReportChartCard } from './ReportChartCard';
import { ReportMetricCard } from './ReportMetricCard';

const COLORS = ['#2563eb', '#7c3aed', '#22c55e', '#f97316', '#ef4444', '#64748b'];

export function ServiceOrdersReportSection({ report }: { report: ServiceOrdersReport | null }) {
  return (
    <ReportChartCard title="Ordenes tecnicas">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={report?.ordersByStatus ?? []} dataKey="value" nameKey="name" outerRadius={90}>{(report?.ordersByStatus ?? []).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ReportMetricCard label="Recibidas" value={report?.receivedOrders ?? 0} />
          <ReportMetricCard label="En proceso" value={report?.inProgressOrders ?? 0} />
          <ReportMetricCard label="Listas" value={report?.readyOrders ?? 0} />
          <ReportMetricCard label="Ingresos" value={formatCurrency(report?.serviceOrderIncome ?? 0)} />
        </div>
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Estado', 'Cantidad']}
          rows={(report?.ordersByStatus ?? []).map((row) => [row.name, row.value ?? 0])}
        />
      </div>
    </ReportChartCard>
  );
}
