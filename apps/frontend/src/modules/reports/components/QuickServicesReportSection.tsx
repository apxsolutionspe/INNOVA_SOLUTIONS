import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatStatusLabel } from '../../../utils/display-formatters';
import { ExportReportModule, QuickServicesReport } from '../types/report.types';
import { formatCurrency, shortDate } from '../utils/report-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportChartCard } from './ReportChartCard';
import { ReportDataTable } from './ReportDataTable';
import { ReportMetricCard } from './ReportMetricCard';

export function QuickServicesReportSection({
  report,
  isExporting,
  onExport,
}: {
  report: QuickServicesReport | null;
  isExporting: boolean;
  onExport: (module: ExportReportModule, type: 'pdf' | 'excel') => void;
}) {
  return (
    <ReportChartCard title="Reporte de servicios rápidos" action={<ExportButtons module="quick-services" isExporting={isExporting} onExport={onExport} />}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report?.topQuickServices ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="amount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ReportMetricCard label="Operaciones" value={report?.totalQuickServices ?? 0} />
          <ReportMetricCard label="Ingresos" value={formatCurrency(report?.quickServicesIncome ?? 0)} />
          <ReportMetricCard label="Ticket promedio" value={formatCurrency(report?.averageTicket ?? 0)} />
          <ReportMetricCard label="Canceladas" value={report?.cancelledOperations ?? 0} />
        </div>
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Fecha', 'Código', 'Servicio', 'Cliente', 'Cantidad', 'Precio unitario', 'Total', 'Estado']}
          rows={(report?.rows ?? []).map((row) => [
            shortDate(row.date),
            row.code,
            row.service,
            row.customer,
            row.quantity,
            formatCurrency(row.unitPrice),
            formatCurrency(row.total),
            formatStatusLabel(row.status),
          ])}
        />
      </div>
    </ReportChartCard>
  );
}
