import { useEffect, useState } from 'react';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ecommerceService, OnlineOrder } from '../services/ecommerce.service';
import { OnlineOrderStatusBadge } from './OnlineOrderStatusBadge';

export function OnlineOrdersTable() {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void ecommerceService.orders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-500 shadow-sm">Cargando pedidos online...</div>;
  if (!orders.length) return <EmptyState title="Sin pedidos online" description="Los pedidos registrados desde eCommerce apareceran aqui." />;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-5 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-400 md:grid">
        <span>Codigo</span><span>Cliente</span><span>Estado</span><span>Pago</span><span>Total</span>
      </div>
      <div className="divide-y divide-slate-100">
        {orders.map((order) => (
          <div key={order.id} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-5 md:items-center">
            <span className="font-black text-slate-950">{order.code}</span>
            <span className="text-slate-600">{order.customerName}</span>
            <OnlineOrderStatusBadge status={order.status} />
            <span className="text-slate-500">{order.paymentStatus}</span>
            <span className="font-black text-brand-blue">S/ {Number(order.total).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
