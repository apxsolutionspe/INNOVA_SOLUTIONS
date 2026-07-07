import { ProfitabilityReport } from '../types/report.types';
import { formatCurrency, formatPercent } from '../utils/report-formatters';
import { ReportDataTable } from './ReportDataTable';
import { ReportChartCard } from './ReportChartCard';
import { ReportMetricCard } from './ReportMetricCard';

export function ProfitabilityBasicSection({ report }: { report: ProfitabilityReport | null }) {
  return (
    <ReportChartCard title="Rentabilidad basica">
      <div className="grid gap-3 md:grid-cols-5">
        <ReportMetricCard label="Ingresos" value={formatCurrency(report?.totalIncome ?? 0)} />
        <ReportMetricCard label="Costos estimados" value={formatCurrency(report?.estimatedCosts ?? 0)} />
        <ReportMetricCard label="Gastos" value={formatCurrency(report?.registeredExpenses ?? 0)} />
        <ReportMetricCard label="Utilidad" value={formatCurrency(report?.estimatedGrossProfit ?? 0)} />
        <ReportMetricCard label="Margen" value={formatPercent(report?.estimatedMargin ?? 0)} />
      </div>
      <div className="mt-5">
        <ReportDataTable
          columns={['Item', 'Utilidad estimada']}
          rows={[
            ...(report?.mostProfitableProducts ?? []).map((row) => [row.name, formatCurrency(row.estimatedProfit ?? row.amount)]),
            ...(report?.mostProfitableQuickServices ?? []).map((row) => [row.name, formatCurrency(row.estimatedProfit ?? row.amount)]),
          ]}
        />
      </div>
    </ReportChartCard>
  );
}
