import { useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AlertTriangle, PackageCheck, ShoppingBag, Truck } from 'lucide-react';

import { PageContainer } from '../../../components/layout/PageContainer';
import { PurchaseOrderFilters } from '../components/PurchaseOrderFilters';
import { PurchaseOrderForm } from '../components/PurchaseOrderForm';
import { PurchaseOrderTable } from '../components/PurchaseOrderTable';
import { usePurchases } from '../hooks/usePurchases';
import { PurchasePayload } from '../types/purchase.types';

export function PurchasesPage() {
  const purchases = usePurchases();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = async (payload: PurchasePayload) => {
    await purchases.createPurchase(payload);
    setIsFormOpen(false);
  };

  const today = new Date().toDateString();
  const purchasesToday = purchases.purchases.filter((purchase) => new Date(purchase.createdAt).toDateString() === today);
  const amountToday = purchasesToday.reduce((sum, purchase) => sum + purchase.total, 0);
  const pending = purchases.purchases.filter((purchase) => purchase.status === 'PENDING' || purchase.status === 'PARTIALLY_RECEIVED').length;
  const received = purchases.purchases.filter((purchase) => purchase.status === 'RECEIVED').length;

  const cards: Array<[string, string | number, LucideIcon, string]> = [
    ['Compras de hoy', purchasesToday.length, ShoppingBag, 'from-brand-blue to-brand-cyan'],
    ['Monto comprado hoy', `S/ ${amountToday.toFixed(2)}`, ShoppingBag, 'from-brand-violet to-brand-blue'],
    ['Compras pendientes', pending, AlertTriangle, 'from-brand-warning to-orange-500'],
    ['Recibidas', received, PackageCheck, 'from-brand-success to-emerald-400'],
  ];

  return (
    <PageContainer title="Compras" description="Ordenes de compra, recepcion de productos e integracion con inventario.">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map(([label, value, Icon, gradient]) => (
          <motion.article key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div>
              <div className={`grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br ${gradient} text-white`}><Icon size={20} /></div>
            </div>
          </motion.article>
        ))}
      </div>
      <PurchaseOrderFilters search={purchases.search} status={purchases.status} onSearchChange={purchases.setSearch} onStatusChange={purchases.setStatus} onCreate={() => setIsFormOpen(true)} />
      {purchases.message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{purchases.message}</div> : null}
      {purchases.error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{purchases.error}</div> : null}
      <PurchaseOrderTable purchases={purchases.purchases} isLoading={purchases.isLoading} />
      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm font-semibold text-cyan-800">
        <Truck className="mr-2 inline" size={18} /> Al recibir productos, el stock sube automaticamente y queda movimiento IN en inventario.
      </div>
      {isFormOpen ? <PurchaseOrderForm onSubmit={handleSubmit} onClose={() => setIsFormOpen(false)} /> : null}
    </PageContainer>
  );
}
