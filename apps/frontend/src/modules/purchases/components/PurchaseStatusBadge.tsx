import { PurchaseOrderStatus } from '../types/purchase.types';

const styles: Record<PurchaseOrderStatus, string> = {
  PENDING: 'bg-orange-50 text-orange-700',
  PARTIALLY_RECEIVED: 'bg-cyan-50 text-cyan-700',
  RECEIVED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const labels: Record<PurchaseOrderStatus, string> = {
  PENDING: 'Pendiente',
  PARTIALLY_RECEIVED: 'Parcial',
  RECEIVED: 'Recibida',
  CANCELLED: 'Cancelada',
};

export function PurchaseStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-bold ${styles[status]}`}>{labels[status]}</span>;
}
