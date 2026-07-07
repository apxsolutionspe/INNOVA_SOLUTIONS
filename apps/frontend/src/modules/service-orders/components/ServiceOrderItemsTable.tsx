import { PackagePlus, Trash2, Wrench } from 'lucide-react';

import { ServiceOrder } from '../types/service-order.types';
import { formatCurrency } from '../utils/service-order-formatters';

export function ServiceOrderItemsTable({
  order,
  onAdd,
  onRemove,
}: {
  order: ServiceOrder;
  onAdd: () => void;
  onRemove: (itemId: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-brand-blue">
            <PackagePlus size={20} />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-950">Repuestos y servicios</h2>
            <p className="text-sm font-semibold text-slate-500">Materiales, repuestos o servicios adicionales asociados a la orden.</p>
          </div>
        </div>
        <button onClick={onAdd} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700">
          <PackagePlus size={16} />
          Agregar repuesto o servicio
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        {order.items.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-500">Detalle</th>
                  <th className="px-4 py-3 text-center text-xs font-black uppercase text-slate-500">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Cantidad</th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Precio unitario</th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Subtotal</th>
                  <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-500">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-black text-slate-900">{item.description}</p>
                      {item.product ? <p className="text-xs font-semibold text-slate-500">Stock actual: {item.product.stock}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${item.product ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}>
                        {item.product ? 'Repuesto' : 'Servicio'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-950">{formatCurrency(item.subtotal)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onRemove(item.id)} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-black text-red-600 transition hover:bg-red-50">
                        <Trash2 size={14} />
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <Wrench size={22} />
            </span>
            <p className="mt-3 text-sm font-black text-slate-800">Aún no hay repuestos ni servicios agregados</p>
            <p className="mt-1 max-w-md text-sm font-semibold text-slate-500">Agrega repuestos usados o servicios externos para mantener el costo de la orden actualizado.</p>
          </div>
        )}
      </div>
    </section>
  );
}
