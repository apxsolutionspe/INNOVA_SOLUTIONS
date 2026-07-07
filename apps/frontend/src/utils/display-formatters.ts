const statusLabels: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  OPEN: 'Abierta',
  CLOSED: 'Cerrada',
  PAID: 'Pagado',
  PARTIAL: 'Parcial',
  PENDING: 'Pendiente',
  COMPLETED: 'Completado',
  CANCELLED: 'Anulado',
  FAILED: 'Fallido',
  ERROR: 'Error',
  CONNECTED: 'Conectado',
  CONFIGURED: 'Configurado',
  NOT_CONFIGURED: 'No configurado',
  MOCK: 'Modo de prueba',
  CREATED: 'Creado',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  RECEIVED: 'Recibido',
  PARTIALLY_RECEIVED: 'Recibido parcialmente',
  DIAGNOSIS: 'En diagnóstico',
  IN_PROGRESS: 'En proceso',
  PREPARING: 'En preparación',
  CONFIRMED: 'Confirmado',
  DRAFT: 'Borrador',
  SENT: 'Enviado',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
};

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFER: 'Transferencia',
  MIXED: 'Mixto',
  MOCK: 'Modo de prueba',
  CULQI: 'Culqi',
  IZIPAY: 'Izipay',
};

const movementTypeLabels: Record<string, string> = {
  IN: 'Entrada',
  OUT: 'Salida',
  ADJUSTMENT: 'Ajuste',
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  SALE: 'Venta',
  SERVICE_PAYMENT: 'Pago de servicio',
};

export function formatStatusLabel(value?: string | boolean | null) {
  if (typeof value === 'boolean') return value ? 'Activo' : 'Inactivo';
  if (!value) return 'Sin estado';
  return statusLabels[value.toUpperCase()] ?? value;
}

export function formatPaymentMethod(value?: string | null) {
  if (!value) return 'Sin método';
  return paymentMethodLabels[value.toUpperCase()] ?? value;
}

export function formatMovementType(value?: string | null) {
  if (!value) return 'Sin tipo';
  return movementTypeLabels[value.toUpperCase()] ?? formatStatusLabel(value);
}
