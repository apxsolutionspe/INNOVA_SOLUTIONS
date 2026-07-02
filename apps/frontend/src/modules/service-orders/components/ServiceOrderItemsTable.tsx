import { ServiceOrder } from '../types/service-order.types';

export function ServiceOrderItemsTable({ order, onAdd, onRemove }: { order: ServiceOrder; onAdd: () => void; onRemove: (itemId: string) => void }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Repuestos y servicios</h2>
        <button onClick={onAdd} className="h-9 rounded-lg bg-brand-blue px-3 text-sm font-bold text-white">Agregar</button>
      </div>
      <div className="mt-4 space-y-2">
        {order.items.length ? order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span>{item.description} x {item.quantity}</span>
            <div className="flex items-center gap-3">
              <strong>S/ {item.subtotal.toFixed(2)}</strong>
              <button onClick={() => onRemove(item.id)} className="text-xs font-bold text-red-600">Quitar</button>
            </div>
          </div>
        )) : <p className="text-sm text-slate-500">Sin items agregados.</p>}
      </div>
    </div>
  );
}
