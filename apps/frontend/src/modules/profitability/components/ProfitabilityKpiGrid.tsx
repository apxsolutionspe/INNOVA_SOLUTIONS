import { Banknote, Percent, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import { formatCurrency, formatPercent } from '../../reports/utils/report-formatters';
import { ProfitabilitySummary } from '../types/profitability.types';
import { ProfitabilityKpiCard } from './ProfitabilityKpiCard';

export function ProfitabilityKpiGrid({ summary }: { summary: ProfitabilitySummary | null }) {
  const productCosts = summary?.productCosts ?? 0;
  const serviceCosts = summary?.quickServiceCosts ?? 0;
  const costs = productCosts + serviceCosts;
  const expenses = summary?.registeredExpenses ?? 0;
  const netProfit = summary?.estimatedNetProfit ?? 0;
  const margin = summary?.profitMargin ?? 0;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-black text-slate-950">Indicadores principales</h2>
        <p className="mt-1 text-sm text-slate-500">Lectura ejecutiva basada en datos reales del backend.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ProfitabilityKpiCard title="Ingresos" value={formatCurrency(summary?.totalIncome ?? 0)} description="Ventas y servicios cobrados" icon={TrendingUp} tone="green" />
        <ProfitabilityKpiCard title="Costos" value={formatCurrency(costs)} description="Productos y servicios" icon={TrendingDown} tone="orange" badge={`Prod. ${formatCurrency(productCosts)}`} />
        <ProfitabilityKpiCard title="Gastos" value={formatCurrency(expenses)} description="Egresos registrados en caja" icon={Banknote} tone="red" />
        <ProfitabilityKpiCard title="Utilidad neta" value={formatCurrency(netProfit)} description="Ingresos - costos - gastos" icon={Wallet} tone={netProfit >= 0 ? 'teal' : 'red'} />
        <ProfitabilityKpiCard title="Margen neto" value={formatPercent(margin)} description="Utilidad neta sobre ingresos" icon={Percent} tone={margin < 0 ? 'red' : margin < 10 ? 'orange' : 'green'} />
      </div>
    </section>
  );
}
