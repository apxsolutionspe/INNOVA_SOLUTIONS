import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ServiceOrdersReport } from '../types/report.types';
import { formatCurrency } from '../utils/report-formatters';
import { ReportChartCard } from './ReportChartCard';

const COLORS = ['#2563eb', '#7c3aed', '#22c55e', '#f97316', '#ef4444', '#64748b'];

export function ServiceOrdersReportSection({ report }: { report: ServiceOrdersReport | null }) {
  return (
    <ReportChartCard title="Ordenes tecnicas">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={report?.ordersByStatus ?? []} dataKey="value" nameKey="name" outerRadius={90}>{(report?.ordersByStatus ?? []).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Recibidas" value={report?.receivedOrders ?? 0} />
          <Metric label="En proceso" value={report?.inProgressOrders ?? 0} />
          <Metric label="Listas" value={report?.readyOrders ?? 0} />
          <Metric label="Ingresos" value={formatCurrency(report?.serviceOrderIncome ?? 0)} />
        </div>
      </div>
    </ReportChartCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}
