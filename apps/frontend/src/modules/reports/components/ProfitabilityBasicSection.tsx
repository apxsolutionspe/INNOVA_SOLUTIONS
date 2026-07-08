import { ExportReportModule, ProfitabilityReport } from '../types/report.types';
import { formatCurrency, formatPercent } from '../utils/report-formatters';
import { ExportButtons } from './ExportButtons';
import { ReportChartCard } from './ReportChartCard';
import { ReportDataTable } from './ReportDataTable';
import { ReportMetricCard } from './ReportMetricCard';

export function ProfitabilityBasicSection({
  report,
  isExporting,
  onExport,
}: {
  report: ProfitabilityReport | null;
  isExporting: boolean;
  onExport: (module: ExportReportModule, type: 'pdf' | 'excel') => void;
}) {
  return (
    <ReportChartCard title="Reporte de rentabilidad" action={<ExportButtons module="profitability" isExporting={isExporting} onExport={onExport} />}>
      <div className="grid gap-3 md:grid-cols-5">
        <ReportMetricCard label="Ingresos" value={formatCurrency(report?.totalIncome ?? 0)} />
        <ReportMetricCard label="Costos estimados" value={formatCurrency(report?.estimatedCosts ?? 0)} />
        <ReportMetricCard label="Gastos" value={formatCurrency(report?.registeredExpenses ?? 0)} />
        <ReportMetricCard label="Utilidad neta" value={formatCurrency(report?.estimatedGrossProfit ?? 0)} />
        <ReportMetricCard label="Margen neto" value={formatPercent(report?.estimatedMargin ?? 0)} />
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Concepto', 'Ingresos', 'Costos', 'Gastos', 'Utilidad']}
          rows={(report?.rows ?? []).map((row) => [
            row.concept,
            formatCurrency(row.income),
            formatCurrency(row.costs),
            formatCurrency(row.expenses),
            formatCurrency(row.profit),
          ])}
        />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ReportDataTable
          columns={['Producto rentable', 'Utilidad estimada']}
          rows={(report?.mostProfitableProducts ?? []).map((row) => [row.name, formatCurrency(row.estimatedProfit ?? row.amount)])}
        />
        <ReportDataTable
          columns={['Servicio rentable', 'Utilidad estimada']}
          rows={(report?.mostProfitableQuickServices ?? []).map((row) => [row.name, formatCurrency(row.estimatedProfit ?? row.amount)])}
        />
      </div>
    </ReportChartCard>
  );
}
