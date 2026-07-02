import { ProfitabilityReport } from '../types/report.types';
import { formatCurrency, formatPercent } from '../utils/report-formatters';
import { ReportChartCard } from './ReportChartCard';

export function ProfitabilityBasicSection({ report }: { report: ProfitabilityReport | null }) {
  return (
    <ReportChartCard title="Rentabilidad basica">
      <div className="grid gap-3 md:grid-cols-5">
        <Metric label="Ingresos" value={formatCurrency(report?.totalIncome ?? 0)} />
        <Metric label="Costos estimados" value={formatCurrency(report?.estimatedCosts ?? 0)} />
        <Metric label="Gastos" value={formatCurrency(report?.registeredExpenses ?? 0)} />
        <Metric label="Utilidad" value={formatCurrency(report?.estimatedGrossProfit ?? 0)} />
        <Metric label="Margen" value={formatPercent(report?.estimatedMargin ?? 0)} />
      </div>
    </ReportChartCard>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>;
}
