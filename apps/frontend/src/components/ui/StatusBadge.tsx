import { Badge } from './Badge';
import { formatStatusLabel } from '../../utils/display-formatters';

function resolveStatus(status: string | boolean) {
  if (typeof status === 'boolean') return status ? ['Activo', 'success'] as const : ['Inactivo', 'neutral'] as const;
  const normalized = status.toUpperCase();
  if (['ACTIVE', 'ACTIVO', 'OPEN', 'ABIERTA', 'PAID', 'COMPLETED', 'CONNECTED', 'DELIVERED', 'READY', 'RECEIVED', 'ACCEPTED'].includes(normalized)) return [formatStatusLabel(status), 'success'] as const;
  if (['IN_PROGRESS', 'PROCESS', 'DIAGNOSIS', 'MOCK', 'CONFIGURED', 'SENT', 'CREATED', 'DRAFT'].includes(normalized)) return [formatStatusLabel(status), 'info'] as const;
  if (['PENDING', 'LOW_STOCK', 'PARTIAL', 'PARTIALLY_RECEIVED', 'NOT_CONFIGURED', 'PREPARING'].includes(normalized)) return [formatStatusLabel(status), 'warning'] as const;
  if (['CANCELLED', 'ERROR', 'FAILED', 'REJECTED', 'SIN STOCK', 'CLOSED'].includes(normalized)) return [formatStatusLabel(status), 'danger'] as const;
  return [formatStatusLabel(status), 'neutral'] as const;
}

export function StatusBadge({ status }: { status: string | boolean }) {
  const [label, variant] = resolveStatus(status);
  return <Badge variant={variant}>{label}</Badge>;
}
