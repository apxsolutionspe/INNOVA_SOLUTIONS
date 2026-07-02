import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { QuickServicesReport } from '../types/report.types';
import { formatCurrency } from '../utils/report-formatters';
import { ReportChartCard } from './ReportChartCard';

export function QuickServicesReportSection({ report }: { report: QuickServicesReport | null }) {
  return (
    <ReportChartCard title="Servicios rapidos">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={report?.topQuickServices ?? []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="quantity" fill="#7c3aed" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Operaciones" value={report?.totalQuickServices ?? 0} />
          <Metric label="Ingresos" value={formatCurrency(report?.quickServicesIncome ?? 0)} />
          <Metric label="Canceladas" value={report?.cancelledOperations ?? 0} />
          <Metric label="Categorias" value={report?.incomeByCategory.length ?? 0} />
        </div>
      </div>
    </ReportChartCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}
