import { formatCurrency, formatPercent } from '../../reports/utils/report-formatters';
import { ProfitabilitySummary } from '../types/profitability.types';

export function ProfitabilitySummaryCards({ summary }: { summary: ProfitabilitySummary | null }) {
  const cards = [['Ingresos', formatCurrency(summary?.totalIncome ?? 0)], ['Costos productos', formatCurrency(summary?.productCosts ?? 0)], ['Costos servicios', formatCurrency(summary?.quickServiceCosts ?? 0)], ['Gastos', formatCurrency(summary?.registeredExpenses ?? 0)], ['Utilidad neta', formatCurrency(summary?.estimatedNetProfit ?? 0)], ['Margen', formatPercent(summary?.profitMargin ?? 0)]];
  return <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">{cards.map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-2 text-xl font-bold text-slate-950">{value}</p></div>)}</div>;
}
