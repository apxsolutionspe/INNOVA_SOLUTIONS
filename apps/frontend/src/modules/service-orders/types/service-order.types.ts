import type { Customer } from '../../customers/types/customer.types';
import type { Product } from '../../inventory/types/inventory.types';
import type { AuthUser } from '../../../types/auth';

export type ServiceOrderStatus =
  | 'RECEIVED'
  | 'DIAGNOSIS'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ServiceOrderItem {
  id: string;
  productId?: string | null;
  product?: Product | null;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ServiceOrderLog {
  id: string;
  previousStatus?: ServiceOrderStatus | null;
  newStatus?: ServiceOrderStatus | null;
  action: string;
  comment?: string | null;
  createdAt: string;
  user: AuthUser;
}

export interface ServiceOrder {
  id: string;
  code: string;
  customerId: string;
  customer: Customer;
  user: AuthUser;
  equipmentType: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  reportedIssue: string;
  technicalDiagnosis?: string | null;
  solutionApplied?: string | null;
  status: ServiceOrderStatus;
  estimatedDeliveryDate?: string | null;
  receivedAt: string;
  deliveredAt?: string | null;
  laborCost: number;
  partsCost: number;
  discount: number;
  total: number;
  notes?: string | null;
  items: ServiceOrderItem[];
  logs: ServiceOrderLog[];
}

export interface ServiceOrdersResponse {
  items: ServiceOrder[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateServiceOrderPayload {
  customerId: string;
  equipmentType: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  reportedIssue: string;
  estimatedDeliveryDate?: string;
  notes?: string;
}
