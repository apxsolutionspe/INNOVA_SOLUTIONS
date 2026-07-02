import { FormEvent, useState } from 'react';

import { PurchaseOrder } from '../types/purchase.types';

interface Props {
  purchase: PurchaseOrder;
  onSubmit: (items: Array<{ itemId: string; receivedQuantity: number }>, notes?: string) => Promise<void>;
  onClose: () => void;
}

export function ReceivePurchaseModal({ purchase, onSubmit, onClose }: Props) {
  const [items, setItems] = useState(() => purchase.items.map((item) => ({ itemId: item.id, receivedQuantity: Math.max(item.quantity - item.receivedQuantity, 0) })));
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit(items.filter((item) => item.receivedQuantity > 0), notes);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-xl font-bold text-slate-950">Recibir productos</h2><p className="text-sm text-slate-500">{purchase.code}</p></div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cerrar</button>
        </div>
        <div className="mt-5 space-y-3">
          {purchase.items.map((item, index) => (
            <label key={item.id} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-[1fr_120px]">
              <span className="text-sm font-semibold text-slate-800">{item.product.name}<span className="block text-xs text-slate-500">Pendiente: {item.quantity - item.receivedQuantity}</span></span>
              <input type="number" min={0} max={item.quantity - item.receivedQuantity} value={items[index]?.receivedQuantity ?? 0} onChange={(event) => setItems((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, receivedQuantity: Number(event.target.value) } : draft))} className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
            </label>
          ))}
        </div>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas de recepcion" className="mt-4 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue" />
        <button disabled={isSaving} type="submit" className="mt-5 h-11 w-full rounded-lg bg-brand-success text-sm font-bold text-white disabled:opacity-60">{isSaving ? 'Recibiendo...' : 'Confirmar recepcion'}</button>
      </form>
    </div>
  );
}
