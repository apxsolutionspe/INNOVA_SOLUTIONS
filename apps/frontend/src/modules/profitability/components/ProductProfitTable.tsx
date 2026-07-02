import { ProfitItem } from '../types/profitability.types';
import { formatCurrency, formatPercent } from '../../reports/utils/report-formatters';
import { EmptyState, TableShell } from '../../../components/ui';
import { Trophy } from 'lucide-react';

export function ProductProfitTable({ items, title }: { items: ProfitItem[]; title: string }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">Ordenado por utilidad estimada descendente.</p>
      </div>
      {!items.length ? (
        <div className="p-4">
          <EmptyState title="Sin datos de rentabilidad" description="No hay registros suficientes para construir esta tabla." icon={Trophy} />
        </div>
      ) : (
        <TableShell maxHeight="clamp(320px,45vh,520px)" className="rounded-none border-0 shadow-none">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs font-black uppercase tracking-wide text-slate-500 backdrop-blur">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Ingresos</th>
                <th className="px-4 py-3">Costo</th>
                <th className="px-4 py-3">Utilidad</th>
                <th className="px-4 py-3">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.slice(0, 10).map((item) => (
                <tr key={item.name} className="transition hover:bg-blue-50/35">
                  <td className="px-4 py-3 font-bold text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(item.income)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatCurrency(item.cost)}</td>
                  <td className={`px-4 py-3 font-black ${item.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(item.profit)}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{formatPercent(item.margin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}
    </section>
  );
}
