import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  FileText,
  MessageCircle,
  PackageCheck,
  Printer,
  ReceiptText,
  UserRound,
  Wrench,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import { PageContainer } from '../../../components/layout/PageContainer';
import { useAuthStore } from '../../../store/auth.store';
import { AddServiceOrderItemModal } from '../components/AddServiceOrderItemModal';
import { ChangeStatusModal } from '../components/ChangeStatusModal';
import { DeliverOrderModal } from '../components/DeliverOrderModal';
import { ServiceOrderItemsTable } from '../components/ServiceOrderItemsTable';
import { ServiceOrderPhotoGallery } from '../components/ServiceOrderPhotoGallery';
import { ServiceOrderReceiptModal } from '../components/ServiceOrderReceiptModal';
import { ServiceOrderStatusBadge } from '../components/ServiceOrderStatusBadge';
import { ServiceOrderTimeline } from '../components/ServiceOrderTimeline';
import { TechnicalDiagnosisForm } from '../components/TechnicalDiagnosisForm';
import { serviceOrdersService } from '../services/service-orders.service';
import { ServiceOrder, ServiceOrderStatus } from '../types/service-order.types';
import { formatCurrency, formatDateTime, formatShortDate } from '../utils/service-order-formatters';
import { serviceOrderStatusLabels } from '../utils/service-order-status';

function SummaryCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-brand-blue">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-slate-400">{label}</p>
          <p className="mt-1 truncate text-lg font-black text-slate-950">{value}</p>
          {hint ? <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p> : null}
        </div>
      </div>
    </article>
  );
}

function InfoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value || '-'}</p>
    </div>
  );
}

export function ServiceOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [receiptHtml, setReceiptHtml] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    setOrder(await serviceOrdersService.findOne(id));
  };

  useEffect(() => {
    void loadOrder();
  }, [id]);

  if (!order) return <PageContainer title="Orden técnica" description="Cargando información de la orden..." />;

  const refresh = async (updated: Promise<ServiceOrder>) => {
    setOrder(await updated);
  };

  const canEditEvidence = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const canCancel = user?.role.name === 'ADMIN' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
  const equipmentName = [order.equipmentType, order.brand, order.model].filter(Boolean).join(' ');

  const openTicket = async () => {
    setActionMessage('');
    setActionError('');
    const data = await serviceOrdersService.ticket(order.id);
    setReceiptHtml(data.html);
  };

  const sendWhatsApp = async () => {
    setActionMessage('');
    setActionError('');
    setIsSendingWhatsApp(true);
    try {
      const response = await serviceOrdersService.sendWhatsApp(order.id);
      if (response.whatsappUrl) {
        window.open(response.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
      if (response.success === false) {
        setActionError(response.message || 'No se pudo enviar por WhatsApp.');
      } else {
        setActionMessage(response.message || 'Ticket preparado para enviar por WhatsApp.');
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo enviar por WhatsApp.');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const cancelOrder = () => {
    const reason = window.prompt('Motivo de cancelación');
    if (reason) void refresh(serviceOrdersService.cancel(order.id, reason));
  };

  return (
    <PageContainer title={order.code} description={`${equipmentName || 'Equipo registrado'} · ${order.customer.fullName}`}>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-5 py-6 text-white sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <button onClick={() => navigate('/service-orders')} className="mb-4 inline-flex h-9 items-center gap-2 rounded-xl border border-white/15 px-3 text-xs font-black text-slate-200 transition hover:bg-white/10">
                <ArrowLeft size={15} />
                Volver a órdenes
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">{order.code}</h1>
                <ServiceOrderStatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-lg font-bold text-slate-200">{equipmentName || 'Equipo sin detalle'}</p>
              <p className="mt-1 text-sm font-semibold text-slate-400">Cliente: {order.customer.fullName} · Recepción: {formatDateTime(order.receivedAt)}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowStatusModal(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-slate-950 shadow-sm transition hover:bg-slate-100">
                <CalendarClock size={16} />
                Cambiar estado
              </button>
              <button onClick={() => void openTicket()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-black text-white transition hover:bg-white/10">
                <Printer size={16} />
                Imprimir ticket
              </button>
              <button onClick={() => void sendWhatsApp()} disabled={isSendingWhatsApp} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-black text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-60">
                <MessageCircle size={16} />
                {isSendingWhatsApp ? 'Enviando...' : 'Enviar por WhatsApp'}
              </button>
              {order.status === 'READY' ? (
                <button onClick={() => setShowDeliverModal(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-black text-white shadow-sm transition hover:bg-cyan-600">
                  <PackageCheck size={16} />
                  Entregar equipo
                </button>
              ) : null}
              {canCancel ? (
                <button onClick={cancelOrder} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-red-700">
                  <XCircle size={16} />
                  Cancelar
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard icon={UserRound} label="Cliente" value={order.customer.fullName} hint={order.customer.phone ?? 'Sin teléfono registrado'} />
          <SummaryCard icon={Wrench} label="Equipo" value={order.equipmentType} hint={[order.brand, order.model].filter(Boolean).join(' ') || 'Sin marca/modelo'} />
          <SummaryCard icon={ClipboardList} label="Estado" value={serviceOrderStatusLabels[order.status]} hint={`Última recepción: ${formatShortDate(order.receivedAt)}`} />
          <SummaryCard icon={ReceiptText} label="Total actual" value={formatCurrency(order.total)} hint={`Entrega: ${formatShortDate(order.estimatedDeliveryDate)}`} />
        </div>
      </section>

      {actionMessage ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{actionMessage}</div> : null}
      {actionError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{actionError}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <InfoBlock title="Información del cliente">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Nombre" value={order.customer.fullName} />
                <DetailRow label="Documento" value={order.customer.documentNumber} />
                <DetailRow label="Teléfono / WhatsApp" value={order.customer.phone} />
                <DetailRow label="Correo" value={order.customer.email} />
              </div>
            </InfoBlock>

            <InfoBlock title="Datos del equipo">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow label="Tipo" value={order.equipmentType} />
                <DetailRow label="Marca" value={order.brand} />
                <DetailRow label="Modelo" value={order.model} />
                <DetailRow label="Serie" value={order.serialNumber} />
                <DetailRow label="Color" value={order.color} />
                <DetailRow label="Fecha estimada" value={formatShortDate(order.estimatedDeliveryDate)} />
              </div>
            </InfoBlock>
          </div>

          <InfoBlock title="Recepción del equipo">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Estado físico inicial</p>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">{order.physicalCondition ?? 'Sin observaciones visibles registradas.'}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Accesorios recibidos</p>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">{order.accessoriesReceived ?? 'No se registraron accesorios.'}</p>
              </div>
            </div>
          </InfoBlock>

          <InfoBlock title="Falla y diagnóstico">
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Falla reportada por el cliente</p>
                <p className="mt-2 rounded-2xl bg-orange-50 p-4 text-sm font-semibold leading-6 text-orange-900">{order.reportedIssue}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Diagnóstico inicial</p>
                <p className="mt-2 rounded-2xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-900">{order.initialDiagnosis ?? 'Pendiente de revisión técnica.'}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Diagnóstico técnico</p>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">{order.technicalDiagnosis ?? 'Aún no se registró diagnóstico técnico.'}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Solución aplicada</p>
                <p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">{order.solutionApplied ?? 'Aún no se registró una solución aplicada.'}</p>
              </div>
            </div>
          </InfoBlock>

          <ServiceOrderPhotoGallery
            photos={order.photos ?? []}
            canEdit={canEditEvidence}
            onDelete={(photoId) => refresh(serviceOrdersService.deletePhoto(order.id, photoId))}
          />

          <TechnicalDiagnosisForm order={order} onSubmit={(payload) => refresh(serviceOrdersService.update(order.id, payload))} />
          <ServiceOrderItemsTable order={order} onAdd={() => setShowItemModal(true)} onRemove={(itemId) => refresh(serviceOrdersService.removeItem(order.id, itemId))} />
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Costos</h2>
            <div className="mt-4 space-y-3">
              <p className="flex justify-between text-sm"><span className="font-semibold text-slate-500">Mano de obra</span><strong>{formatCurrency(order.laborCost)}</strong></p>
              <p className="flex justify-between text-sm"><span className="font-semibold text-slate-500">Repuestos/servicios</span><strong>{formatCurrency(order.partsCost)}</strong></p>
              <p className="flex justify-between text-sm"><span className="font-semibold text-slate-500">Descuento</span><strong className="text-red-600">-{formatCurrency(order.discount)}</strong></p>
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-right">
                <p className="text-xs font-black uppercase text-emerald-700">Total actual</p>
                <p className="text-3xl font-black text-emerald-700">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Acciones rápidas</h2>
            <div className="mt-4 grid gap-2">
              <button onClick={() => void openTicket()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50">
                <FileText size={16} />
                Ver ticket
              </button>
              <button onClick={() => void openTicket()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50">
                <Printer size={16} />
                Imprimir ticket
              </button>
              <button onClick={() => void sendWhatsApp()} disabled={isSendingWhatsApp} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
                <MessageCircle size={16} />
                {isSendingWhatsApp ? 'Enviando...' : 'Enviar por WhatsApp'}
              </button>
            </div>
          </section>

          <ServiceOrderTimeline logs={order.logs} />
        </aside>
      </div>

      {showItemModal ? <AddServiceOrderItemModal onClose={() => setShowItemModal(false)} onSubmit={(payload) => refresh(serviceOrdersService.addItem(order.id, payload))} /> : null}
      {showStatusModal ? <ChangeStatusModal onClose={() => setShowStatusModal(false)} onSubmit={(status: ServiceOrderStatus, comment) => refresh(serviceOrdersService.changeStatus(order.id, status, comment))} /> : null}
      {showDeliverModal ? <DeliverOrderModal onClose={() => setShowDeliverModal(false)} onConfirm={() => refresh(serviceOrdersService.deliver(order.id))} /> : null}
      {receiptHtml ? <ServiceOrderReceiptModal html={receiptHtml} onClose={() => setReceiptHtml('')} /> : null}
    </PageContainer>
  );
}
