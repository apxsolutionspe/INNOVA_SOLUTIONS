import { ProfitItem } from '../types/profitability.types';
import { formatCurrency, formatPercent } from '../../reports/utils/report-formatters';
import { EmptyState, TableShell } from '../../../components/ui';
import { BarChart3, Medal, Trophy } from 'lucide-react';

type ProfitKind = 'product' | 'service';

const rankingStyles = [
  'border-amber-200 bg-amber-50/80 text-amber-800',
  'border-slate-200 bg-slate-50 text-slate-700',
  'border-orange-200 bg-orange-50/80 text-orange-800',
];

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function resolveMarginBadge(margin: number) {
  const safeMargin = safeNumber(margin);
  if (safeMargin >= 35) return { label: 'Margen alto', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100', bar: 'bg-emerald-500' };
  if (safeMargin >= 15) return { label: 'Margen medio', tone: 'bg-blue-50 text-blue-700 border-blue-100', bar: 'bg-blue-500' };
  return { label: 'Margen bajo', tone: 'bg-orange-50 text-orange-700 border-orange-100', bar: 'bg-orange-500' };
}

function ProfitRankingCard({ item, index, kind }: { item: ProfitItem; index: number; kind: ProfitKind }) {
  const margin = safeNumber(item.margin);
  const badge = resolveMarginBadge(margin);
  const progress = Math.max(0, Math.min(100, margin));
  const quantityLabel = kind === 'product' ? 'unidades vendidas' : 'servicios realizados';

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-violet" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${rankingStyles[index] ?? rankingStyles[1]}`}>
            #{index + 1}
          </span>
          <h3 className="mt-3 line-clamp-2 text-base font-black leading-tight text-slate-950" title={item.name}>
            {item.name}
          </h3>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Medal size={20} />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">Utilidad</p>
        <p className={`mt-1 break-words text-2xl font-black leading-tight ${item.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
          {formatCurrency(item.profit)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${badge.tone}`}>{badge.label}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">
          Margen {formatPercent(margin)}
        </span>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${badge.bar}`} style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-500">
        <span>{item.quantity} {quantityLabel}</span>
        <span>Ingresos: <strong className="text-slate-800">{formatCurrency(item.income)}</strong></span>
        <span>Costo: <strong className="text-slate-800">{formatCurrency(item.cost)}</strong></span>
      </div>
    </article>
  );
}

export function ProductProfitTable({ items, title, kind = 'product' }: { items: ProfitItem[]; title: string; kind?: ProfitKind }) {
  const topItems = items.slice(0, 3);
  const noun = kind === 'product' ? 'producto' : 'servicio';

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">Ranking ejecutivo ordenado por utilidad estimada descendente.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            <BarChart3 size={14} />
            {items.length} registros
          </span>
        </div>
      </div>
      {!items.length ? (
        <div className="p-4">
          <EmptyState
            title="No hay datos suficientes para calcular rentabilidad."
            description={`Registra ventas, servicios o compras para generar el análisis de este ${noun}.`}
            icon={Trophy}
          />
        </div>
      ) : (
        <div className="space-y-5 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-3">
            {topItems.map((item, index) => (
              <ProfitRankingCard key={`${item.name}-${index}`} item={item} index={index} kind={kind} />
            ))}
          </div>

          <TableShell maxHeight="clamp(320px,45vh,520px)" className="rounded-2xl shadow-none">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100/95 text-left text-xs font-black uppercase tracking-wide text-slate-500 backdrop-blur">
                <tr>
                  <th className="px-4 py-3">Ranking</th>
                  <th className="px-4 py-3">{kind === 'product' ? 'Producto' : 'Servicio'}</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Ingresos</th>
                  <th className="px-4 py-3 text-right">Costo</th>
                  <th className="px-4 py-3 text-right">Utilidad</th>
                  <th className="px-4 py-3 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  const badge = resolveMarginBadge(item.margin);
                  const progress = Math.max(0, Math.min(100, safeNumber(item.margin)));

                  return (
                    <tr key={`${item.name}-${index}`} className="transition hover:bg-blue-50/35">
                      <td className="px-4 py-3 font-black text-slate-500">#{index + 1}</td>
                      <td className="max-w-[18rem] px-4 py-3">
                        <p className="line-clamp-2 font-bold leading-snug text-slate-800" title={item.name}>{item.name}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-600">{formatCurrency(item.income)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-600">{formatCurrency(item.cost)}</td>
                      <td className={`px-4 py-3 text-right font-black ${item.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(item.profit)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="ml-auto flex min-w-28 max-w-36 flex-col items-end gap-1">
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-black ${badge.tone}`}>{formatPercent(item.margin)}</span>
                          <span className="h-1.5 w-full rounded-full bg-slate-100">
                            <span className={`block h-full rounded-full ${badge.bar}`} style={{ width: `${progress}%` }} />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableShell>
        </div>
      )}
    </section>
  );
}

