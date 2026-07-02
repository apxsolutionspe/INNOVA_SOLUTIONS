import { useNavigate } from 'react-router-dom';

import { Button, LoadingState, TableShell } from '../../../components/ui';
import { ServiceOrder } from '../types/service-order.types';
import { ServiceOrderStatusBadge } from './ServiceOrderStatusBadge';

export function ServiceOrderTable({ orders, isLoading }: { orders: ServiceOrder[]; isLoading: boolean }) {
  const navigate = useNavigate();
  if (isLoading) return <LoadingState rows={6} />;
  if (!orders.length) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <TableShell maxHeight="clamp(380px,54vh,640px)" className="hidden rounded-none border-0 shadow-none lg:block">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs font-black uppercase tracking-wide text-slate-500 backdrop-blur">
          <tr><th className="px-4 py-3">Orden</th><th>Cliente</th><th>Equipo</th><th>Recepción</th><th>Estado</th><th>Total</th><th></th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.id} className="transition hover:bg-blue-50/35">
                <td className="px-4 py-3">
                  <p className="font-black text-slate-950">{order.code}</p>
                  <p className="text-xs font-semibold text-slate-400">{order.serialNumber || 'Sin serie'}</p>
                </td>
                <td className="font-semibold text-slate-800">{order.customer.fullName}</td>
                <td>
                  <p className="font-bold text-slate-800">{order.equipmentType}</p>
                  <p className="text-xs text-slate-500">{[order.brand, order.model].filter(Boolean).join(' ') || 'Sin marca/modelo'}</p>
                </td>
                <td className="text-slate-600">{new Date(order.receivedAt).toLocaleDateString('es-PE')}</td>
              <td><ServiceOrderStatusBadge status={order.status} /></td>
              <td className="font-bold">S/ {order.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <Button type="button" variant="secondary" size="sm" onClick={() => navigate(`/service-orders/${order.id}`)}>Ver detalle</Button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      </TableShell>

      <div className="table-scroll-shell max-h-[70vh] divide-y divide-slate-100 overflow-y-auto lg:hidden">
        {orders.map((order) => (
          <article key={order.id} className="space-y-4 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">{order.code}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">{order.customer.fullName}</p>
              </div>
              <ServiceOrderStatusBadge status={order.status} />
            </div>
            <div className="grid gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Equipo</p>
                <p className="font-bold text-slate-800">{order.equipmentType} {[order.brand, order.model].filter(Boolean).join(' ')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Serie</p>
                  <p className="font-semibold text-slate-700">{order.serialNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">Recepción</p>
                  <p className="font-semibold text-slate-700">{new Date(order.receivedAt).toLocaleDateString('es-PE')}</p>
                </div>
              </div>
            </div>
            <Button type="button" variant="secondary" className="w-full" onClick={() => navigate(`/service-orders/${order.id}`)}>Ver detalle</Button>
          </article>
        ))}
      </div>
    </div>
  );
}
