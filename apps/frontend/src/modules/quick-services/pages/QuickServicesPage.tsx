import { useState } from 'react';

import { useAuthStore } from '../../../store/auth.store';
import { CancelQuickServiceSaleModal } from '../components/CancelQuickServiceSaleModal';
import { QuickServiceAdminPanel } from '../components/QuickServiceAdminPanel';
import { QuickServiceCartPanel } from '../components/QuickServiceCartPanel';
import { QuickServiceCategorySidebar } from '../components/QuickServiceCategorySidebar';
import { QuickServiceDetailModal } from '../components/QuickServiceDetailModal';
import { QuickServiceErrorState } from '../components/QuickServiceErrorState';
import { QuickServiceGrid } from '../components/QuickServiceGrid';
import { QuickServicePaymentPanel } from '../components/QuickServicePaymentPanel';
import { QuickServiceReceiptModal } from '../components/QuickServiceReceiptModal';
import { QuickServiceSaleModal } from '../components/QuickServiceSaleModal';
import { QuickServiceSalesHistory } from '../components/QuickServiceSalesHistory';
import { QuickServiceSearchBar } from '../components/QuickServiceSearchBar';
import { QuickServicesHeader } from '../components/QuickServicesHeader';
import { QuickServicesKpiCards } from '../components/QuickServicesKpiCards';
import { QuickServicesTabs } from '../components/QuickServicesTabs';
import { useQuickServices } from '../hooks/useQuickServices';
import { quickServicesService } from '../services/quick-services.service';
import { QuickService, QuickServiceSale } from '../types/quick-service.types';
import { QuickServicesTab } from '../types/quick-service-ui.types';

export function QuickServicesPage() {
  const quick = useQuickServices();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role.name === 'ADMIN';
  const [activeTab, setActiveTab] = useState<QuickServicesTab>('operation');
  const [toCancel, setToCancel] = useState<QuickServiceSale | null>(null);
  const [selectedService, setSelectedService] = useState<QuickService | null>(null);

  const hasReferenceIssue = quick.paymentMethod !== 'CASH' && !quick.paymentReference.trim();
  const disabledReason = !quick.cashSession
    ? 'Debe abrir caja antes de registrar servicios rápidos.'
    : !quick.cart.length
      ? 'Agrega servicios al carrito antes de confirmar.'
      : quick.cart.some((item) => item.quantity <= 0)
        ? 'Las cantidades deben ser mayores a cero.'
        : hasReferenceIssue
          ? 'Los pagos digitales o por transferencia requieren referencia.'
          : quick.discount < 0 || quick.discount > quick.totals.subtotal
            ? 'El descuento debe estar dentro del subtotal.'
            : '';

  const loadReceipt = (sale: QuickServiceSale) => {
    void quick.loadReceipt(sale.id);
  };

  const cancelSale = async (reason: string) => {
    if (!toCancel) return;
    await quickServicesService.cancel(toCancel.id, reason);
    setToCancel(null);
    await quick.reload();
  };

  return (
    <section className="mx-auto flex w-full max-w-[96rem] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <QuickServicesHeader
        cashSession={quick.cashSession}
        isAdmin={isAdmin}
        isLoading={quick.isLoading}
        onRefresh={() => void quick.reload()}
        onTabChange={setActiveTab}
      />

      <QuickServicesKpiCards sales={quick.sales} />
      <QuickServicesTabs activeTab={activeTab} isAdmin={isAdmin} onChange={setActiveTab} />

      {quick.error ? <QuickServiceErrorState message={quick.error} /> : null}

      {activeTab === 'operation' ? (
        <div className="grid gap-5 xl:grid-cols-[15.5rem_minmax(0,1fr)_23rem] 2xl:grid-cols-[16.5rem_minmax(0,1fr)_24rem]">
          <QuickServiceCategorySidebar
            categories={quick.categories}
            services={quick.allServices}
            selectedCategoryId={quick.categoryId}
            onChange={quick.setCategoryId}
          />

          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Servicios disponibles</h2>
                  <p className="mt-1 text-sm text-slate-500">Busca, revisa detalle y agrega servicios al carrito.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                  {quick.services.length} en vista
                </span>
              </div>
            </div>
            <QuickServiceSearchBar search={quick.search} resultCount={quick.services.length} onChange={quick.setSearch} />
            <QuickServiceGrid
              services={quick.services}
              isLoading={quick.isLoading}
              onAdd={quick.add}
              onDetail={setSelectedService}
            />
          </section>

          <aside className="space-y-4 xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto xl:pr-1">
            <QuickServiceCartPanel
              cart={quick.cart}
              subtotal={quick.totals.subtotal}
              onQty={quick.qty}
              onRemove={quick.remove}
              onClear={quick.clearCart}
            />
            <QuickServicePaymentPanel
              customers={quick.customers}
              customer={quick.selectedCustomer}
              setCustomer={quick.setSelectedCustomer}
              paymentMethod={quick.paymentMethod}
              setPaymentMethod={quick.setPaymentMethod}
              reference={quick.paymentReference}
              setReference={quick.setPaymentReference}
              discount={quick.discount}
              setDiscount={quick.setDiscount}
              subtotal={quick.totals.subtotal}
              total={quick.totals.total}
              isSaving={quick.isSaving}
              disabledReason={disabledReason}
              onConfirm={() => void quick.confirm()}
            />
          </aside>
        </div>
      ) : null}

      {activeTab === 'admin' && isAdmin ? (
        <QuickServiceAdminPanel categories={quick.categories} services={quick.allServices} onReload={quick.reload} />
      ) : null}

      {activeTab === 'history' ? (
        <QuickServiceSalesHistory
          sales={quick.sales}
          isAdmin={isAdmin}
          onReceipt={loadReceipt}
          onCancel={(sale) => setToCancel(sale)}
        />
      ) : null}

      {quick.successSale ? (
        <QuickServiceSaleModal
          sale={quick.successSale}
          onReceipt={() => void quick.loadReceipt(quick.successSale!.id)}
          onClose={() => quick.setSuccessSale(null)}
        />
      ) : null}
      {selectedService ? (
        <QuickServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onAdd={quick.add}
        />
      ) : null}
      {quick.receipt ? <QuickServiceReceiptModal html={quick.receipt.html} onClose={() => quick.setReceipt(null)} /> : null}
      {toCancel ? <CancelQuickServiceSaleModal onClose={() => setToCancel(null)} onSubmit={cancelSale} /> : null}
    </section>
  );
}
