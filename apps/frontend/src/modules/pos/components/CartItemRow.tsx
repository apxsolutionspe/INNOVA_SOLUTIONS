import { Minus, Plus, Trash2 } from 'lucide-react';

import { CartItem } from '../types/pos.types';

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const lineTotal = item.product.salePrice * item.quantity - item.discount;
  const isAtMaxStock = item.quantity >= item.product.stock;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-950">{item.product.name}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {item.product.sku} - S/ {item.product.salePrice.toFixed(2)} c/u
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.product.id)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
          title="Quitar producto"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => onQuantityChange(item.product.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white disabled:opacity-40"
            title="Disminuir cantidad"
          >
            <Minus size={15} />
          </button>
          <input
            type="number"
            min="1"
            max={item.product.stock}
            value={item.quantity}
            onChange={(event) => onQuantityChange(item.product.id, Number(event.target.value))}
            className="h-8 w-12 bg-transparent text-center text-sm font-black text-slate-900 outline-none"
          />
          <button
            type="button"
            onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
            disabled={isAtMaxStock}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white disabled:opacity-40"
            title="Aumentar cantidad"
          >
            <Plus size={15} />
          </button>
        </div>

        <div className="text-right">
          <p className="text-xs font-bold text-slate-400">Subtotal</p>
          <p className="text-lg font-black text-slate-950">S/ {lineTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Stock disponible: {item.product.stock}</span>
        {isAtMaxStock ? <span className="text-orange-700">Limite alcanzado</span> : null}
      </div>
    </div>
  );
}
