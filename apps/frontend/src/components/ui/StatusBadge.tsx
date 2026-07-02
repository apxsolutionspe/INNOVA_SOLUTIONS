import { Badge } from './Badge';

function resolveStatus(status: string | boolean) {
  if (typeof status === 'boolean') return status ? ['Activo', 'success'] as const : ['Inactivo', 'neutral'] as const;
  const normalized = status.toUpperCase();
  if (['ACTIVE', 'ACTIVO', 'OPEN', 'ABIERTA', 'PAID', 'COMPLETED', 'CONNECTED', 'DELIVERED', 'READY'].includes(normalized)) return [status, 'success'] as const;
  if (['IN_PROGRESS', 'PROCESS', 'DIAGNOSIS', 'MOCK', 'CONFIGURED'].includes(normalized)) return [status, 'info'] as const;
  if (['PENDING', 'LOW_STOCK', 'PARTIAL', 'NOT_CONFIGURED'].includes(normalized)) return [status, 'warning'] as const;
  if (['CANCELLED', 'ERROR', 'FAILED', 'SIN STOCK', 'CLOSED'].includes(normalized)) return [status, 'danger'] as const;
  return [status, 'neutral'] as const;
}

export function StatusBadge({ status }: { status: string | boolean }) {
  const [label, variant] = resolveStatus(status);
  return <Badge variant={variant}>{label}</Badge>;
}
