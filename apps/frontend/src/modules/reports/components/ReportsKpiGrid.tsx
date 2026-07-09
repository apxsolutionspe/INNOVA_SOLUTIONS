import { AlertTriangle, Banknote, Boxes, ClipboardList, ReceiptText, ShoppingBag, TrendingUp, Zap } from 'lucide-react';

import { ReportsSummary } from '../types/report.types';
import { formatCurrency } from '../utils/report-formatters';
import { ReportKpiCard } from './ReportKpiCard';

export function ReportsKpiGrid({ summary }: { summary: ReportsSummary | null }) {
  const totalIncome =
    (summary?.totalSalesAmount ?? 0) +
    (summary?.totalQuickServicesAmount ?? 0) +
    (summary?.totalServiceOrdersAmount ?? 0);
  const pendingTotal = (summary?.pendingServiceOrders ?? 0) + (summary?.pendingPurchases ?? 0);

  const cards = [
    {
      title: 'Ingresos totales',
      value: formatCurrency(totalIncome),
      description: 'Ventas, servicios rápidos y órdenes',
      icon: TrendingUp,
      tone: 'green' as const,
    },
    {
      title: 'Ventas',
      value: formatCurrency(summary?.totalSalesAmount ?? 0),
      description: `${summary?.totalSales ?? 0} operaciones registradas`,
      icon: ReceiptText,
      tone: 'blue' as const,
    },
    {
      title: 'Servicios',
      value: formatCurrency(summary?.totalQuickServicesAmount ?? 0),
      description: 'Ingresos por servicios rápidos',
      icon: Zap,
      tone: 'cyan' as const,
    },
    {
      title: 'Órdenes técnicas',
      value: formatCurrency(summary?.totalServiceOrdersAmount ?? 0),
      description: `${summary?.pendingServiceOrders ?? 0} pendientes`,
      icon: ClipboardList,
      tone: 'violet' as const,
    },
    {
      title: 'Compras',
      value: formatCurrency(summary?.totalPurchasesAmount ?? 0),
      description: `${summary?.pendingPurchases ?? 0} pendientes`,
      icon: ShoppingBag,
      tone: 'orange' as const,
    },
    {
      title: 'Gastos',
      value: formatCurrency(summary?.totalExpenses ?? 0),
      description: 'Egresos registrados en caja',
      icon: Banknote,
      tone: 'red' as const,
    },
    {
      title: 'Utilidad estimada',
      value: formatCurrency(summary?.netIncome ?? 0),
      description: 'Resultado operativo del periodo',
      icon: TrendingUp,
      tone: (summary?.netIncome ?? 0) >= 0 ? 'green' as const : 'red' as const,
    },
    {
      title: 'Pendientes',
      value: pendingTotal,
      description: `Stock crítico: ${summary?.productsLowStock ?? 0}`,
      icon: pendingTotal || (summary?.productsLowStock ?? 0) ? AlertTriangle : Boxes,
      tone: pendingTotal || (summary?.productsLowStock ?? 0) ? 'orange' as const : 'slate' as const,
    },
  ];

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-black text-slate-950">Resumen ejecutivo</h2>
        <p className="mt-1 text-sm text-slate-500">Indicadores clave consolidados sin duplicar información operativa.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <ReportKpiCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}

