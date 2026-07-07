import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, RotateCcw, XCircle } from 'lucide-react';

import { PageContainer } from '../../../components/layout/PageContainer';
import { formatPaymentMethod, formatStatusLabel } from '../../../utils/display-formatters';
import { CancelPurchaseModal } from '../components/CancelPurchaseModal';
import { PurchaseOrderItemsTable } from '../components/PurchaseOrderItemsTable';
import { PurchaseReceiptModal } from '../components/PurchaseReceiptModal';
import { PurchaseStatusBadge } from '../components/PurchaseStatusBadge';
import { ReceivePurchaseModal } from '../components/ReceivePurchaseModal';
import { purchasesService } from '../services/purchases.service';
import { PurchaseOrder } from '../types/purchase.types';

export function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<PurchaseOrder | null>(null);
  const [error, setError] = useState('');
  const [receiptHtml, setReceiptHtml] = useState('');
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const loadPurchase = async () => {
    if (!id) return;
    try {
      setPurchase(await purchasesService.findOne(id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la compra.');
    }
  };

  useEffect(() => {
    void loadPurchase();
  }, [id]);

  if (!id) {
    navigate('/purchases');
    return null;
  }

  if (!purchase) {
    return <PageContainer title="Detalle de compra" description="Cargando información...">{error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}</PageContainer>;
  }

  const canManage = purchase.status !== 'RECEIVED' && purchase.status !== 'CANCELLED';

  return (
    <PageContainer title={`Compra ${purchase.code}`} description="Detalle, recepción, comprobante y movimientos asociados.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/purchases" className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700"><ArrowLeft size={17} /> Volver</Link>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => void purchasesService.receipt(purchase.id).then((data) => setReceiptHtml(data.html))} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white"><Printer size={17} /> Comprobante</button>
          {canManage ? <button onClick={() => setIsReceiveOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-brand-success px-3 py-2 text-sm font-bold text-white"><RotateCcw size={17} /> Recibir</button> : null}
          {canManage ? <button onClick={() => setIsCancelOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white"><XCircle size={17} /> Cancelar</button> : null}
        </div>
      </div>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase text-slate-400">Proveedor</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{purchase.supplier.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{purchase.supplier.ruc || 'Sin RUC'} | {purchase.supplier.phone || 'Sin teléfono'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Estado</p>
          <div className="mt-3"><PurchaseStatusBadge status={purchase.status} /></div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total</p>
          <p className="mt-2 text-3xl font-bold text-brand-success">S/ {purchase.total.toFixed(2)}</p>
        </div>
      </section>

      <PurchaseOrderItemsTable items={purchase.items} />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-400">Pago</p><p className="mt-2 font-bold text-slate-900">{formatStatusLabel(purchase.paymentStatus)} {purchase.paymentMethod ? `- ${formatPaymentMethod(purchase.paymentMethod)}` : ''}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-400">Responsable</p><p className="mt-2 font-bold text-slate-900">{purchase.user.fullName}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-400">Recepción</p><p className="mt-2 font-bold text-slate-900">{purchase.receivedAt ? new Date(purchase.receivedAt).toLocaleDateString() : 'Pendiente'}</p></div>
      </section>

      {isReceiveOpen ? <ReceivePurchaseModal purchase={purchase} onClose={() => setIsReceiveOpen(false)} onSubmit={async (items, notes) => { setPurchase(await purchasesService.receive(purchase.id, { items, notes })); setIsReceiveOpen(false); }} /> : null}
      {isCancelOpen ? <CancelPurchaseModal onClose={() => setIsCancelOpen(false)} onSubmit={async (reason) => { setPurchase(await purchasesService.cancel(purchase.id, reason)); setIsCancelOpen(false); }} /> : null}
      {receiptHtml ? <PurchaseReceiptModal html={receiptHtml} onClose={() => setReceiptHtml('')} /> : null}
    </PageContainer>
  );
}
