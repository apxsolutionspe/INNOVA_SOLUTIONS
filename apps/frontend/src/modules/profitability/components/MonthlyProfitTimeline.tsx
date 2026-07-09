import { CalendarDays, Coins, LucideIcon, ReceiptText, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';

import { EmptyState } from '../../../components/ui';
import { formatCurrency, formatPercent } from '../../reports/utils/report-formatters';
import { MonthlyProfit } from '../types/profitability.types';

function safeMargin(profit: number, income: number) {
  return income > 0 ? (profit / income) * 100 : 0;
}

export function MonthlyProfitTimeline({ data }: { data: MonthlyProfit[] }) {
  if (!data.length) {
    return <EmptyState title="Sin periodos" description="Aún no hay datos mensuales de rentabilidad." icon={CalendarDays} />;
  }

  return (
    <div className="grid gap-3">
      {data.slice(0, 8).map((item) => {
        const margin = safeMargin(item.profit, item.income);
        const isPositive = item.profit >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
          <article key={item.month} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  <TrendIcon size={21} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Periodo</p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">{item.month}</h3>
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    Margen neto {formatPercent(margin)}
                  </span>
                </div>
              </div>

              <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniMetric icon={WalletCards} label="Ingresos" value={formatCurrency(item.income)} tone="text-blue-700 bg-blue-50" />
                <MiniMetric icon={Coins} label="Costos" value={formatCurrency(item.costs)} tone="text-orange-700 bg-orange-50" />
                <MiniMetric icon={ReceiptText} label="Gastos" value={formatCurrency(item.expenses)} tone="text-red-700 bg-red-50" />
                <MiniMetric icon={TrendIcon} label="Utilidad neta" value={formatCurrency(item.profit)} tone={isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'} strong />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
  tone,
  strong = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}>
          <Icon size={16} />
        </span>
        <span className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</span>
      </div>
      <p className={`mt-2 break-words text-sm leading-tight ${strong ? 'font-black text-slate-950' : 'font-bold text-slate-700'}`}>{value}</p>
    </div>
  );
}
