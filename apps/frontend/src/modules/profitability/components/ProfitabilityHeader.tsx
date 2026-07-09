import { RefreshCw, TrendingUp } from 'lucide-react';

import { Button } from '../../../components/ui';
import { formatPercent } from '../../reports/utils/report-formatters';

interface ProfitabilityHeaderProps {
  margin: number;
  netProfit: number;
  isLoading: boolean;
  onRefresh: () => void;
}

function resolveStatus(margin: number, netProfit: number) {
  if (netProfit < 0) return { label: 'Rentabilidad negativa', tone: 'bg-red-50 text-red-700 border-red-100' };
  if (margin < 10) return { label: 'Margen bajo', tone: 'bg-orange-50 text-orange-700 border-orange-100' };
  return { label: 'Saludable', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
}

export function ProfitabilityHeader({ margin, netProfit, isLoading, onRefresh }: ProfitabilityHeaderProps) {
  const status = resolveStatus(margin, netProfit);

  return (
    <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-brand-blue">Análisis financiero</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Rentabilidad</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Análisis avanzado de ingresos, costos, gastos y utilidad estimada para tomar decisiones de precio, compras y reposición.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${status.tone}`}>
              <TrendingUp size={14} />
              {status.label}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              Margen neto {formatPercent(margin)}
            </span>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
          Actualizar
        </Button>
      </div>
    </header>
  );
}
