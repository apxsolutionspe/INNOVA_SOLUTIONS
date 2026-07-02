import { QuickServiceCartItem } from '../types/quick-service.types';

export function QuickServiceCart({ cart, onQty, onRemove }: { cart: QuickServiceCartItem[]; onQty: (id: string, qty: number) => void; onRemove: (id: string) => void }) {
  if (!cart.length) return <div className="rounded-lg border border-dashed bg-white p-6 text-center text-sm text-slate-500">Carrito vacio.</div>;
  return <div className="rounded-lg border bg-white p-4 shadow-sm"><h2 className="font-bold">Carrito</h2><div className="mt-3 space-y-2">{cart.map((item) => <div key={item.service.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm"><div><p className="font-bold">{item.service.name}</p><p>S/ {item.service.unitPrice.toFixed(2)}</p></div><input type="number" min="1" value={item.quantity} onChange={(e) => onQty(item.service.id, Number(e.target.value))} className="h-9 w-16 rounded-lg border text-center" /><strong>S/ {(item.service.unitPrice * item.quantity).toFixed(2)}</strong><button onClick={() => onRemove(item.service.id)} className="text-xs font-bold text-red-600">Quitar</button></div>)}</div></div>;
}
