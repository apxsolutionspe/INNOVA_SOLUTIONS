import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageContainer } from '../../../components/layout/PageContainer';
import { useAuthStore } from '../../../store/auth.store';
import { AddServiceOrderItemModal } from '../components/AddServiceOrderItemModal';
import { ChangeStatusModal } from '../components/ChangeStatusModal';
import { DeliverOrderModal } from '../components/DeliverOrderModal';
import { ServiceOrderItemsTable } from '../components/ServiceOrderItemsTable';
import { ServiceOrderReceiptModal } from '../components/ServiceOrderReceiptModal';
import { ServiceOrderStatusBadge } from '../components/ServiceOrderStatusBadge';
import { ServiceOrderTimeline } from '../components/ServiceOrderTimeline';
import { TechnicalDiagnosisForm } from '../components/TechnicalDiagnosisForm';
import { serviceOrdersService } from '../services/service-orders.service';
import { ServiceOrder, ServiceOrderStatus } from '../types/service-order.types';

export function ServiceOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [receiptHtml, setReceiptHtml] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setOrder(await serviceOrdersService.findOne(id));
  };

  useEffect(() => {
    void loadOrder();
  }, [id]);

  if (!order) return <PageContainer title="Orden tecnica" description="Cargando orden..." />;

  const refresh = async (updated: Promise<ServiceOrder>) => {
    setOrder(await updated);
  };

  return (
    <PageContainer title={order.code} description={`${order.equipmentType} ${order.brand ?? ''} ${order.model ?? ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-5 shadow-sm">
        <div><ServiceOrderStatusBadge status={order.status} /><p className="mt-3 text-sm text-slate-500">Cliente: {order.customer.fullName}</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowStatusModal(true)} className="h-10 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white">Cambiar estado</button>
          <button onClick={() => void serviceOrdersService.receipt(order.id).then((data) => setReceiptHtml(data.html))} className="h-10 rounded-lg border px-4 text-sm font-bold">Comprobante</button>
          {order.status === 'READY' ? <button onClick={() => setShowDeliverModal(true)} className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white">Entregar</button> : null}
          {user?.role.name === 'ADMIN' ? <button onClick={() => { const reason = window.prompt('Motivo de cancelacion'); if (reason) void refresh(serviceOrdersService.cancel(order.id, reason)); }} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white">Cancelar</button> : null}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="font-bold">Cliente</h2><p className="mt-2 text-sm">{order.customer.fullName}</p><p className="text-sm text-slate-500">{order.customer.phone ?? '-'}</p></section>
            <section className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="font-bold">Equipo</h2><p className="mt-2 text-sm">{order.equipmentType}</p><p className="text-sm text-slate-500">{order.brand ?? '-'} {order.model ?? ''} / {order.serialNumber ?? '-'}</p></section>
          </div>
          <section className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="font-bold">Falla reportada</h2><p className="mt-2 text-sm text-slate-600">{order.reportedIssue}</p></section>
          <TechnicalDiagnosisForm onSubmit={(payload) => refresh(serviceOrdersService.update(order.id, payload))} />
          <ServiceOrderItemsTable order={order} onAdd={() => setShowItemModal(true)} onRemove={(itemId) => refresh(serviceOrdersService.removeItem(order.id, itemId))} />
        </div>
        <div className="space-y-5">
          <section className="rounded-lg border bg-white p-5 shadow-sm"><h2 className="font-bold">Costos</h2><p className="mt-3 flex justify-between text-sm"><span>Mano de obra</span><strong>S/ {order.laborCost.toFixed(2)}</strong></p><p className="flex justify-between text-sm"><span>Repuestos</span><strong>S/ {order.partsCost.toFixed(2)}</strong></p><p className="flex justify-between text-sm"><span>Descuento</span><strong>S/ {order.discount.toFixed(2)}</strong></p><p className="mt-4 text-right text-3xl font-black text-emerald-700">S/ {order.total.toFixed(2)}</p></section>
          <ServiceOrderTimeline logs={order.logs} />
          <button onClick={() => navigate('/service-orders')} className="h-10 rounded-lg border px-4 text-sm font-bold">Volver</button>
        </div>
      </div>

      {showItemModal ? <AddServiceOrderItemModal onClose={() => setShowItemModal(false)} onSubmit={(payload) => refresh(serviceOrdersService.addItem(order.id, payload))} /> : null}
      {showStatusModal ? <ChangeStatusModal onClose={() => setShowStatusModal(false)} onSubmit={(status: ServiceOrderStatus, comment) => refresh(serviceOrdersService.changeStatus(order.id, status, comment))} /> : null}
      {showDeliverModal ? <DeliverOrderModal onClose={() => setShowDeliverModal(false)} onConfirm={() => refresh(serviceOrdersService.deliver(order.id))} /> : null}
      {receiptHtml ? <ServiceOrderReceiptModal html={receiptHtml} onClose={() => setReceiptHtml('')} /> : null}
    </PageContainer>
  );
}
