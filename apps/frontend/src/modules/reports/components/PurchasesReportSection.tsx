import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatStatusLabel } from '../../../utils/display-formatters';
import { ExportReportModule, PurchasesReport } from '../types/report.types';
import { formatCurrency, shortDate } from '../utils/report-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportChartCard } from './ReportChartCard';
import { ReportDataTable } from './ReportDataTable';
import { ReportMetricCard } from './ReportMetricCard';

export function PurchasesReportSection({
  report,
  isExporting,
  onExport,
}: {
  report: PurchasesReport | null;
  isExporting: boolean;
  onExport: (module: ExportReportModule, type: 'pdf' | 'excel') => void;
}) {
  const data = report?.purchasesByPeriod.map((item) => ({ ...item, date: shortDate(item.date) })) ?? [];

  return (
    <ReportChartCard title="Reporte de compras" action={<ExportButtons module="purchases" isExporting={isExporting} onExport={onExport} />}>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="total" stroke="#f97316" fill="#fed7aa" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <ReportMetricCard label="Órdenes de compra" value={report?.totalPurchases ?? 0} />
          <ReportMetricCard label="Monto comprado" value={formatCurrency(report?.totalPurchasedAmount ?? 0)} />
          <ReportMetricCard label="Pendientes" value={report?.pendingPurchases ?? 0} />
          <ReportMetricCard label="Proveedores" value={report?.suppliersCount ?? 0} />
        </div>
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Fecha', 'Proveedor', 'Código', 'Productos', 'Estado', 'Estado de pago', 'Total']}
          rows={(report?.rows ?? []).map((row) => [
            shortDate(row.date),
            row.supplier,
            row.code,
            row.products,
            formatStatusLabel(row.status),
            formatStatusLabel(row.paymentStatus),
            formatCurrency(row.total),
          ])}
        />
      </div>
    </ReportChartCard>
  );
}
