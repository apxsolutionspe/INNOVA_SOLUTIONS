import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { formatStatusLabel } from '../../../utils/display-formatters';
import { ExportReportModule, ServiceOrdersReport } from '../types/report.types';
import { formatCurrency, shortDate } from '../utils/report-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportChartCard } from './ReportChartCard';
import { ReportDataTable } from './ReportDataTable';
import { ReportMetricCard } from './ReportMetricCard';

const COLORS = ['#2563eb', '#7c3aed', '#22c55e', '#f97316', '#ef4444', '#64748b'];

export function ServiceOrdersReportSection({
  report,
  isExporting,
  onExport,
}: {
  report: ServiceOrdersReport | null;
  isExporting: boolean;
  onExport: (module: ExportReportModule, type: 'pdf' | 'excel') => void;
}) {
  return (
    <ReportChartCard title="Reporte de servicios técnicos" action={<ExportButtons module="service-orders" isExporting={isExporting} onExport={onExport} />}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={report?.ordersByStatus ?? []} dataKey="value" nameKey="name" outerRadius={90}>
                {(report?.ordersByStatus ?? []).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [value, formatStatusLabel(String(name))]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ReportMetricCard label="Órdenes totales" value={report?.totalOrders ?? 0} />
          <ReportMetricCard label="Pendientes" value={report?.pendingOrders ?? 0} />
          <ReportMetricCard label="Listas" value={report?.readyOrders ?? 0} />
          <ReportMetricCard label="Entregadas" value={report?.deliveredOrders ?? 0} />
          <ReportMetricCard label="Mano de obra" value={formatCurrency(report?.laborTotal ?? 0)} />
          <ReportMetricCard label="Ingresos cobrados" value={formatCurrency(report?.serviceOrderIncome ?? 0)} />
        </div>
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Código OT', 'Fecha', 'Cliente', 'Equipo', 'Falla reportada', 'Diagnóstico', 'Estado', 'Mano de obra', 'Repuestos', 'Descuento', 'Total']}
          rows={(report?.rows ?? []).map((row) => [
            row.code,
            shortDate(row.receivedAt),
            row.customer,
            row.equipment,
            row.reportedIssue,
            row.diagnosis,
            formatStatusLabel(row.status),
            formatCurrency(row.laborCost),
            formatCurrency(row.partsCost),
            formatCurrency(row.discount),
            formatCurrency(row.total),
          ])}
        />
      </div>
    </ReportChartCard>
  );
}
