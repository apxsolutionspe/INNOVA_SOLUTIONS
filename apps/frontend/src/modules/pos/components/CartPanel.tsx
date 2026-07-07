import { ShoppingCart, Trash2 } from 'lucide-react';

import { CartItem } from '../types/pos.types';
import { CartItemRow } from './CartItemRow';
import { PosEmptyState } from './PosEmptyState';

interface CartPanelProps {
  items: CartItem[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function CartPanel({ items, onQuantityChange, onRemove, onClear }: CartPanelProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="flex min-h-[18rem] flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:min-h-[22rem]">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <ShoppingCart size={18} />
            Carrito de venta
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">{itemCount} unidades agregadas</p>
        </div>
        {items.length ? (
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

      {!items.length ? (
        <div className="grid min-h-[13rem] flex-1 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3">
          <PosEmptyState
            title="Agrega productos para iniciar una venta"
            description="El carrito mostrara cantidades, subtotales y limites de stock."
            icon={ShoppingCart}
          />
        </div>
      ) : (
        <div className="sidebar-scroll min-h-[13rem] flex-1 space-y-3 overflow-y-auto pr-1 xl:max-h-[38vh]">
          {items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  );
}
