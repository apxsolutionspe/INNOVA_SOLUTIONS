import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { PurchasesReport } from '../types/report.types';
import { formatCurrency, shortDate } from '../utils/report-formatters';
import { ReportDataTable } from './ReportDataTable';
import { ReportChartCard } from './ReportChartCard';
import { ReportMetricCard } from './ReportMetricCard';

export function PurchasesReportSection({ report }: { report: PurchasesReport | null }) {
  const data = report?.purchasesByPeriod.map((item) => ({ ...item, date: shortDate(item.date) })) ?? [];
  return (
    <ReportChartCard title="Compras">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Area type="monotone" dataKey="total" stroke="#f97316" fill="#fed7aa" /></AreaChart></ResponsiveContainer></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <ReportMetricCard label="Monto comprado" value={formatCurrency(report?.totalPurchasedAmount ?? 0)} />
          <ReportMetricCard label="Pendientes" value={report?.pendingPurchases ?? 0} />
          <ReportMetricCard label="Recibidas" value={report?.receivedPurchases ?? 0} />
        </div>
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Proveedor', 'Operaciones', 'Monto']}
          rows={(report?.topSuppliers ?? []).map((row) => [row.name, row.count ?? 0, formatCurrency(row.amount)])}
        />
      </div>
    </ReportChartCard>
  );
}
