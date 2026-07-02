import { motion } from 'framer-motion';
import { Banknote, Landmark, ReceiptText, Smartphone, TrendingDown, WalletCards } from 'lucide-react';

import { CashSession, CashSummary } from '../types/cash.types';
import { formatMoney } from '../utils/cash-calculations';
import { CashStatusBadge } from './CashStatusBadge';

export function CashSummaryCards({ session, summary }: { session: CashSession | null; summary: CashSummary }) {
  const cards = [
    {
      label: 'Estado actual',
      value: <CashStatusBadge status={summary.currentCashStatus} />,
      description: session?.code ?? 'Sin caja abierta',
      icon: WalletCards,
      tone: 'bg-slate-100 text-slate-700',
    },
    { label: 'Monto inicial', value: formatMoney(session?.openingAmount ?? 0), description: 'Base de apertura', icon: Banknote, tone: 'bg-blue-50 text-brand-blue' },
    { label: 'Efectivo', value: formatMoney(summary.totalCashToday), description: 'Ventas y movimientos en efectivo', icon: Banknote, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Yape', value: formatMoney(summary.totalYapeToday), description: 'Pagos digitales Yape', icon: Smartphone, tone: 'bg-violet-50 text-violet-700' },
    { label: 'Plin', value: formatMoney(summary.totalPlinToday), description: 'Pagos digitales Plin', icon: Smartphone, tone: 'bg-cyan-50 text-cyan-700' },
    { label: 'Transferencia', value: formatMoney(summary.totalTransferToday), description: 'Bancos y transferencias', icon: Landmark, tone: 'bg-indigo-50 text-indigo-700' },
    { label: 'Gastos', value: formatMoney(summary.expensesToday), description: 'Egresos registrados', icon: TrendingDown, tone: 'bg-red-50 text-red-700' },
    { label: 'Neto esperado', value: formatMoney(summary.netCashToday), description: 'Ingresos menos gastos', icon: ReceiptText, tone: 'bg-orange-50 text-orange-700' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${card.tone}`}>
                <Icon size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">{card.label}</p>
                <div className="mt-1 text-xl font-black text-slate-950">{card.value}</div>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{card.description}</p>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
