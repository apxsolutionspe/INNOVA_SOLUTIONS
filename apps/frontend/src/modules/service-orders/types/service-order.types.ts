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

export interface ServiceOrderPhoto {
  id: string;
  serviceOrderId: string;
  imageData: string;
  fileName?: string | null;
  mimeType: string;
  sizeBytes?: number | null;
  note?: string | null;
  createdAt: string;
}

export interface ServiceOrderPhotoPayload {
  imageData: string;
  fileName?: string;
  mimeType: string;
  sizeBytes?: number;
  note?: string;
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
  color?: string | null;
  physicalCondition?: string | null;
  accessoriesReceived?: string | null;
  reportedIssue: string;
  initialDiagnosis?: string | null;
  receptionNotes?: string | null;
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
  photos: ServiceOrderPhoto[];
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
  color?: string;
  physicalCondition?: string;
  accessoriesReceived?: string;
  reportedIssue: string;
  initialDiagnosis?: string;
  receptionNotes?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  photos?: ServiceOrderPhotoPayload[];
}
