import { ShoppingBasket, Trash2 } from 'lucide-react';

import { QuickServiceCartItem as CartItem } from '../types/quick-service.types';
import { QuickServiceCartItem } from './QuickServiceCartItem';
import { QuickServiceEmptyState } from './QuickServiceEmptyState';

interface QuickServiceCartPanelProps {
  cart: CartItem[];
  subtotal: number;
  onQty: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function QuickServiceCartPanel({ cart, subtotal, onQty, onRemove, onClear }: QuickServiceCartPanelProps) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="flex min-h-[24rem] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm xl:min-h-0 xl:flex-1">
      <div className="mb-3 flex shrink-0 items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <ShoppingBasket size={18} />
            Carrito y pago
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">{itemCount} servicios agregados</p>
        </div>
        {cart.length ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-red-200 hover:text-red-600"
          >
            <Trash2 size={14} />
            Limpiar
          </button>
        ) : null}
      </div>

      {!cart.length ? (
        <div className="flex flex-1 items-center">
          <QuickServiceEmptyState
            title="Agrega servicios para iniciar"
            description="El carrito mostrará cantidades, subtotal y total."
            icon={ShoppingBasket}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
            {cart.map((item) => (
              <QuickServiceCartItem key={item.service.id} item={item} onQty={onQty} onRemove={onRemove} />
            ))}
          </div>
          <div className="mt-3 shrink-0 rounded-xl border border-violet-100 bg-white p-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <strong className="text-slate-950">S/ {subtotal.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
