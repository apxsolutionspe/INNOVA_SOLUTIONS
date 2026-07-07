import { CreditCard, ShoppingBag } from 'lucide-react';

import { Customer } from '../../customers/types/customer.types';
import { CartItem, PaymentInput, SalePreviewTotals } from '../types/pos.types';
import { CartPanel } from './CartPanel';
import { CustomerSelector } from './CustomerSelector';
import { PaymentPanel } from './PaymentPanel';
import { SaleSummary } from './SaleSummary';

interface SaleSidePanelProps {
  items: CartItem[];
  totals: SalePreviewTotals;
  payments: PaymentInput[];
  customers: Customer[];
  selectedCustomer: Customer | null;
  cartCount: number;
  isSaving: boolean;
  disabledReason?: string;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onSelectCustomer: (customer: Customer | null) => void;
  onPaymentsChange: (payments: PaymentInput[]) => void;
  onConfirm: () => void;
}

export function SaleSidePanel({
  items,
  totals,
  payments,
  customers,
  selectedCustomer,
  cartCount,
  isSaving,
  disabledReason,
  onQuantityChange,
  onRemove,
  onClear,
  onSelectCustomer,
  onPaymentsChange,
  onConfirm,
}: SaleSidePanelProps) {
  return (
    <aside className="min-w-0 xl:sticky xl:top-20 xl:self-start">
      <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 xl:min-h-[calc(100dvh-11rem)] xl:max-h-[calc(100dvh-6rem)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#0f172a,#1d4ed8)] px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black">
                <ShoppingBag size={18} />
                Venta actual
              </p>
              <p className="mt-1 text-xs font-semibold text-blue-100">Carrito, cliente, pago y cierre en un solo panel.</p>
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/12">
              <CreditCard size={19} />
            </div>
          </div>
        </div>

        <div className="sidebar-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-visible bg-slate-50/70 p-3 sm:p-4 xl:overflow-y-auto">
          <CartPanel
            items={items}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
            onClear={onClear}
          />
          <CustomerSelector customers={customers} selectedCustomer={selectedCustomer} onSelect={onSelectCustomer} />
          <PaymentPanel payments={payments} total={totals.total} onChange={onPaymentsChange} />
          <div className="mt-auto">
            <SaleSummary
              totals={totals}
              cartCount={cartCount}
              isSaving={isSaving}
              disabledReason={disabledReason}
              onConfirm={onConfirm}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
