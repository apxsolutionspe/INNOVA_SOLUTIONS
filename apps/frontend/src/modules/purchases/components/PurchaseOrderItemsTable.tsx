import { TableShell } from '../../../components/ui';
import { PurchaseOrderItem } from '../types/purchase.types';

export function PurchaseOrderItemsTable({ items }: { items: PurchaseOrderItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <TableShell maxHeight="clamp(280px,40vh,460px)" className="rounded-none border-0 shadow-none">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs font-bold uppercase text-slate-500 backdrop-blur">
          <tr><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Solicitado</th><th className="px-4 py-3">Recibido</th><th className="px-4 py-3">Costo</th><th className="px-4 py-3">Subtotal</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="transition hover:bg-blue-50/35">
              <td className="px-4 py-3 font-semibold text-slate-900">{item.product.name}</td>
              <td className="px-4 py-3">{item.quantity}</td>
              <td className="px-4 py-3">{item.receivedQuantity}</td>
              <td className="px-4 py-3">S/ {item.unitCost.toFixed(2)}</td>
              <td className="px-4 py-3 font-bold">S/ {item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </TableShell>
    </div>
  );
}
