import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

import { formatPercent } from '../../reports/utils/report-formatters';
import { ProfitabilitySummary } from '../types/profitability.types';

type AlertTone = 'critical' | 'warning' | 'info' | 'healthy';

const styles: Record<AlertTone, { item: string; icon: typeof AlertTriangle; label: string }> = {
  critical: { item: 'border-red-100 bg-red-50 text-red-800', icon: ShieldAlert, label: 'Critico' },
  warning: { item: 'border-orange-100 bg-orange-50 text-orange-800', icon: AlertTriangle, label: 'Advertencia' },
  info: { item: 'border-blue-100 bg-blue-50 text-blue-800', icon: Info, label: 'Informativo' },
  healthy: { item: 'border-emerald-100 bg-emerald-50 text-emerald-800', icon: CheckCircle2, label: 'Saludable' },
};

function buildAlerts(summary: ProfitabilitySummary | null) {
  if (!summary || summary.totalIncome <= 0) {
    return [{ tone: 'info' as const, message: 'Aun no hay suficientes ingresos en el rango seleccionado para calcular alertas completas.' }];
  }

  const alerts: Array<{ tone: AlertTone; message: string }> = [];
  const costs = summary.productCosts + summary.quickServiceCosts;
  const costRatio = summary.totalIncome > 0 ? (costs / summary.totalIncome) * 100 : 0;
  const expenseRatio = summary.totalIncome > 0 ? (summary.registeredExpenses / summary.totalIncome) * 100 : 0;

  if (summary.estimatedNetProfit < 0) alerts.push({ tone: 'critical', message: 'La utilidad neta es negativa en este periodo.' });
  if (summary.profitMargin < 0) alerts.push({ tone: 'critical', message: `Margen neto negativo (${formatPercent(summary.profitMargin)}).` });
  else if (summary.profitMargin < 10) alerts.push({ tone: 'warning', message: `Margen neto bajo (${formatPercent(summary.profitMargin)}). Revisa precios, costos o gastos.` });
  if (costRatio > 70) alerts.push({ tone: 'warning', message: `Los costos representan ${formatPercent(costRatio)} de los ingresos.` });
  if (expenseRatio > 35) alerts.push({ tone: 'warning', message: `Los gastos representan ${formatPercent(expenseRatio)} de los ingresos.` });
  summary.warnings.forEach((warning) => alerts.push({ tone: 'info', message: warning }));

  if (!alerts.length) alerts.push({ tone: 'healthy', message: 'No hay alertas financieras criticas registradas.' });
  return alerts;
}

export function FinancialAlertsPanel({ summary }: { summary: ProfitabilitySummary | null }) {
  const alerts = buildAlerts(summary);

  return (
    <aside className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
      <div>
        <h2 className="text-base font-black text-slate-950">Alertas financieras</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">Senales que requieren revision administrativa.</p>
      </div>
      <div className="mt-4 space-y-3">
        {alerts.map((alert, index) => {
          const style = styles[alert.tone];
          const Icon = style.icon;
          return (
            <div key={`${alert.message}-${index}`} className={`rounded-xl border px-3 py-3 text-sm font-semibold ${style.item}`}>
              <div className="flex gap-3">
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wide opacity-75">{style.label}</span>
                  <p className="mt-1 leading-5">{alert.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
