import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Wallet } from 'lucide-react';

import { PosErrorState } from '../components/PosErrorState';
import { ProductCategoryFilter } from '../components/ProductCategoryFilter';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { ProductGrid } from '../components/ProductGrid';
import { ProductSearch } from '../components/ProductSearch';
import { ReceiptPreviewModal } from '../components/ReceiptPreviewModal';
import { SaleSuccessModal } from '../components/SaleSuccessModal';
import { SaleSidePanel } from '../components/SaleSidePanel';
import { WhatsappReceiptModal } from '../components/WhatsappReceiptModal';
import { usePOS } from '../hooks/usePOS';
import { Product } from '../../inventory/types/inventory.types';

export function PosPage() {
  const pos = usePOS();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const cartCount = pos.cart.reduce((sum, item) => sum + item.quantity, 0);
  const isCashOpen = pos.cashSession?.status === 'OPEN';
  const hasReferenceIssue = pos.payments.some(
    (payment) => payment.method !== 'CASH' && Number(payment.amount) > 0 && !payment.reference?.trim(),
  );
  const confirmBlockReason = !isCashOpen
    ? 'Debe abrir caja antes de registrar ventas.'
    : !pos.cart.length
      ? 'Agrega productos al carrito antes de confirmar.'
      : pos.totals.total <= 0
        ? 'El total de la venta debe ser mayor a cero.'
        : pos.totals.paid < pos.totals.total
          ? 'El monto pagado no cubre el total de la venta.'
          : hasReferenceIssue
            ? 'Los pagos digitales o por transferencia requieren referencia.'
            : '';

  return (
    <section className="mx-auto flex w-full max-w-[100rem] min-w-0 flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:px-6">
      {pos.error ? <PosErrorState message={pos.error} /> : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_25rem] 2xl:grid-cols-[minmax(0,1fr)_27rem]">
        <section className="min-w-0 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <ProductSearch
                  search={pos.search}
                  onChange={pos.setSearch}
                  resultCount={pos.visibleProducts.length}
                  isLoading={pos.isLoading}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <div
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-black ${
                    isCashOpen
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-orange-200 bg-orange-50 text-orange-700'
                  }`}
                >
                  <Wallet size={16} />
                  {isCashOpen ? `Caja abierta: ${pos.cashSession?.code}` : 'Caja cerrada'}
                </div>

                {!isCashOpen ? (
                  <Link
                    to="/cash"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-warning px-3 text-xs font-black text-white shadow-sm transition hover:bg-orange-600"
                  >
                    Abrir caja
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={() => void pos.refresh()}
                  disabled={pos.isLoading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-brand-cyan hover:text-brand-blue disabled:opacity-60"
                >
                  <RefreshCw className={pos.isLoading ? 'animate-spin' : ''} size={15} />
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          <ProductCategoryFilter
            categories={pos.categories}
            selectedCategoryId={pos.selectedCategoryId}
            onChange={pos.setSelectedCategoryId}
          />
          <ProductGrid
            products={pos.visibleProducts}
            isLoading={pos.isLoading}
            cartQuantities={pos.cartQuantities}
            onAdd={pos.addProduct}
            onViewDetail={setSelectedProduct}
          />
        </section>

        <SaleSidePanel
          items={pos.cart}
          totals={pos.totals}
          payments={pos.payments}
          customers={pos.customers}
          selectedCustomer={pos.selectedCustomer}
          cartCount={cartCount}
          isSaving={pos.isSaving}
          disabledReason={confirmBlockReason}
          onQuantityChange={pos.updateQuantity}
          onRemove={pos.removeProduct}
          onClear={pos.clearCart}
          onSelectCustomer={pos.setSelectedCustomer}
          onPaymentsChange={pos.setPayments}
          onConfirm={() => void pos.confirmSale()}
        />
      </div>

      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          inCartQuantity={pos.cartQuantities[selectedProduct.id] ?? 0}
          onAdd={pos.addProduct}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
      {pos.successSale ? (
        <SaleSuccessModal
          sale={pos.successSale}
          onReceipt={() => void pos.loadReceipt(pos.successSale!.id)}
          onWhatsapp={() => setIsWhatsappModalOpen(true)}
          onClose={() => {
            setIsWhatsappModalOpen(false);
            pos.setSuccessSale(null);
          }}
        />
      ) : null}
      {pos.successSale && isWhatsappModalOpen ? (
        <WhatsappReceiptModal
          sale={pos.successSale}
          defaultPhone={pos.successSale.customer?.phone ?? undefined}
          onClose={() => setIsWhatsappModalOpen(false)}
        />
      ) : null}
      {pos.receipt ? <ReceiptPreviewModal receipt={pos.receipt} onClose={() => pos.setReceipt(null)} /> : null}
    </section>
  );
}
