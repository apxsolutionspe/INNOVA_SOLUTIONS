import { useState } from 'react';

import { PosErrorState } from '../components/PosErrorState';
import { PosHeader } from '../components/PosHeader';
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
      : pos.totals.paid < pos.totals.total
        ? 'El monto pagado no cubre el total de la venta.'
        : hasReferenceIssue
          ? 'Los pagos digitales o por transferencia requieren referencia.'
          : '';

  return (
    <section className="mx-auto flex w-full max-w-[100rem] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <PosHeader cashSession={pos.cashSession} isLoading={pos.isLoading} onRefresh={() => void pos.refresh()} />

      {pos.error ? <PosErrorState message={pos.error} /> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_25rem] 2xl:grid-cols-[minmax(0,1fr)_27rem]">
        <section className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-black text-slate-950">Productos</h2>
                <p className="mt-1 text-sm text-slate-500">Busca, filtra y agrega productos disponibles.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                {pos.visibleProducts.length} en vista
              </span>
            </div>
          </div>
          <ProductSearch
            search={pos.search}
            onChange={pos.setSearch}
            resultCount={pos.visibleProducts.length}
            isLoading={pos.isLoading}
          />
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
