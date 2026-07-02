import { serviceOrderStatusClasses, serviceOrderStatusLabels } from '../utils/service-order-status';
import { ServiceOrderStatus } from '../types/service-order.types';

export function ServiceOrderStatusBadge({ status }: { status: ServiceOrderStatus }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${serviceOrderStatusClasses[status]}`}>
      {serviceOrderStatusLabels[status]}
    </span>
  );
}
