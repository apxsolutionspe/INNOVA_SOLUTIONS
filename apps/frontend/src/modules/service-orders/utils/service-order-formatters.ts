import type { ServiceOrderLog, ServiceOrderStatus } from '../types/service-order.types';
import { serviceOrderStatusLabels } from './service-order-status';

export function formatCurrency(value?: number | string | null) {
  const amount = Number(value ?? 0);
  return `S/ ${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(value?: string | Date | null) {
  if (!value) return 'Por definir';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Por definir';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatServiceOrderAction(log: ServiceOrderLog) {
  const labels: Record<string, string> = {
    CREATE_ORDER: 'Orden creada',
    UPDATE_ORDER: 'Orden actualizada',
    ADD_ITEM: 'Repuesto o servicio agregado',
    REMOVE_ITEM: 'Repuesto o servicio retirado',
    CHANGE_STATUS: 'Estado actualizado',
    ADD_PHOTOS: 'Evidencia agregada',
    REMOVE_PHOTO: 'Evidencia retirada',
    SEND_WHATSAPP: 'Ticket enviado por WhatsApp',
    PRINT_TICKET: 'Ticket generado',
    DELIVER_ORDER: 'Equipo entregado',
    CANCEL_ORDER: 'Orden cancelada',
  };

  return labels[log.action] ?? humanizeAction(log.action);
}

export function formatStatusTransition(previousStatus?: ServiceOrderStatus | null, newStatus?: ServiceOrderStatus | null) {
  if (!previousStatus && !newStatus) return '';
  if (!previousStatus && newStatus) return `Nuevo estado: ${serviceOrderStatusLabels[newStatus]}`;
  if (previousStatus && newStatus) {
    return `${serviceOrderStatusLabels[previousStatus]} → ${serviceOrderStatusLabels[newStatus]}`;
  }
  return previousStatus ? `Desde ${serviceOrderStatusLabels[previousStatus]}` : '';
}

function humanizeAction(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
