import { Banknote, ReceiptText, Star, Zap } from 'lucide-react';

import { QuickServiceSale } from '../types/quick-service.types';

function isToday(date: string) {
  const value = new Date(date);
  const now = new Date();
  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth() && value.getDate() === now.getDate();
}

export function QuickServicesKpiCards({ sales }: { sales: QuickServiceSale[] }) {
  const todaySales = sales.filter((sale) => sale.status === 'COMPLETED' && isToday(sale.createdAt));
  const incomeToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const topServiceMap = todaySales
    .flatMap((sale) => sale.items)
    .reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.description] = (accumulator[item.description] ?? 0) + item.quantity;
      return accumulator;
    }, {});
  const topService = Object.entries(topServiceMap).sort((first, second) => second[1] - first[1])[0]?.[0] ?? 'Sin datos';

  const cards = [
    { label: 'Servicios de hoy', value: todaySales.length, icon: Zap, className: 'from-brand-blue to-brand-cyan' },
    { label: 'Ingresos rapidos', value: `S/ ${incomeToday.toFixed(2)}`, icon: Banknote, className: 'from-brand-success to-emerald-400' },
    { label: 'Operaciones', value: sales.length, icon: ReceiptText, className: 'from-brand-violet to-brand-blue' },
    { label: 'Mas solicitado', value: topService, icon: Star, className: 'from-orange-500 to-brand-warning' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className={`h-1 bg-gradient-to-r ${card.className}`} />
            <div className="flex items-center gap-4 p-4">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${card.className} text-white shadow-sm`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-slate-400">{card.label}</p>
                <p className="mt-1 truncate text-xl font-black text-slate-950">{card.value}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
