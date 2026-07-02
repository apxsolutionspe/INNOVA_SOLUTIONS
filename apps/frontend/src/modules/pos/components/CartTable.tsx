import { CartItem } from '../types/pos.types';

interface CartTableProps {
  items: CartItem[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartTable({ items, onQuantityChange, onRemove }: CartTableProps) {
  if (!items.length) {
    return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">Carrito vacio.</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr><th className="px-3 py-3 text-left">Producto</th><th>Cant.</th><th>Total</th><th></th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.product.id}>
              <td className="px-3 py-3">
                <p className="font-semibold text-slate-800">{item.product.name}</p>
                <p className="text-xs text-slate-500">S/ {item.product.salePrice.toFixed(2)} c/u</p>
              </td>
              <td className="px-3 py-3">
                <input type="number" min="1" max={item.product.stock} value={item.quantity} onChange={(event) => onQuantityChange(item.product.id, Number(event.target.value))} className="h-9 w-16 rounded-lg border border-slate-200 px-2 text-center" />
              </td>
              <td className="px-3 py-3 font-bold text-slate-900">S/ {(item.product.salePrice * item.quantity - item.discount).toFixed(2)}</td>
              <td className="px-3 py-3 text-right">
                <button onClick={() => onRemove(item.product.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-bold text-red-600">Quitar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
