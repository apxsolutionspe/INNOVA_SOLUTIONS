import { Minus, Plus, Trash2 } from 'lucide-react';

import { QuickServiceCartItem as CartItem } from '../types/quick-service.types';

interface QuickServiceCartItemProps {
  item: CartItem;
  onQty: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function QuickServiceCartItem({ item, onQty, onRemove }: QuickServiceCartItemProps) {
  const subtotal = item.service.unitPrice * item.quantity;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black text-slate-950">{item.service.name}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">S/ {item.service.unitPrice.toFixed(2)} por {item.service.unit}</p>
          {item.option ? <p className="mt-2 rounded-full bg-blue-50 px-2 py-1 text-[11px] font-black text-brand-blue">{item.option}</p> : null}
          {item.notes ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.notes}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.service.id)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
          title="Quitar servicio"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => onQty(item.service.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white disabled:opacity-40"
          >
            <Minus size={15} />
          </button>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) => onQty(item.service.id, Number(event.target.value))}
            className="h-8 w-12 bg-transparent text-center text-sm font-black text-slate-900 outline-none"
          />
          <button
            type="button"
            onClick={() => onQty(item.service.id, item.quantity + 1)}
            className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-white"
          >
            <Plus size={15} />
          </button>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400">Subtotal</p>
          <p className="text-lg font-black text-slate-950">S/ {subtotal.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
