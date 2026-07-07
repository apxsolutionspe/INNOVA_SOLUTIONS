import { ServiceOrderStatus } from '../types/service-order.types';

export const serviceOrderStatusLabels: Record<ServiceOrderStatus, string> = {
  RECEIVED: 'Recibido',
  DIAGNOSIS: 'En diagnóstico',
  IN_PROGRESS: 'En reparación',
  READY: 'Listo para entrega',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export const serviceOrderStatusClasses: Record<ServiceOrderStatus, string> = {
  RECEIVED: 'bg-blue-50 text-blue-700 border-blue-200',
  DIAGNOSIS: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  IN_PROGRESS: 'bg-violet-50 text-violet-700 border-violet-200',
  READY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DELIVERED: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};
