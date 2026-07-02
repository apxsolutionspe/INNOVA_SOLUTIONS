import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { PurchasesReport } from '../types/report.types';
import { formatCurrency, shortDate } from '../utils/report-formatters';
import { ReportChartCard } from './ReportChartCard';

export function PurchasesReportSection({ report }: { report: PurchasesReport | null }) {
  const data = report?.purchasesByPeriod.map((item) => ({ ...item, date: shortDate(item.date) })) ?? [];
  return (
    <ReportChartCard title="Compras">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Area type="monotone" dataKey="total" stroke="#f97316" fill="#fed7aa" /></AreaChart></ResponsiveContainer></div>
        <div className="space-y-3">
          <Metric label="Monto comprado" value={formatCurrency(report?.totalPurchasedAmount ?? 0)} />
          <Metric label="Pendientes" value={report?.pendingPurchases ?? 0} />
          <Metric label="Recibidas" value={report?.receivedPurchases ?? 0} />
        </div>
      </div>
    </ReportChartCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}
