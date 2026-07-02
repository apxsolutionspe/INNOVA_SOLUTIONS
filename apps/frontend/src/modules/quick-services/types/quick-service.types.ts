import type { Customer } from '../../customers/types/customer.types';
import type { AuthUser } from '../../../types/auth';

export type PaymentMethod = 'CASH' | 'YAPE' | 'PLIN' | 'TRANSFER' | 'MIXED';
export type QuickServiceSaleStatus = 'COMPLETED' | 'CANCELLED';

export interface QuickServiceCategory {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

export interface QuickService {
  id: string;
  categoryId: string;
  category: QuickServiceCategory;
  name: string;
  description?: string | null;
  unit: string;
  unitPrice: number;
  costPrice?: number | null;
}

export interface QuickServiceCartItem {
  service: QuickService;
  quantity: number;
  option?: string;
  notes?: string;
}

export interface QuickServiceSale {
  id: string;
  code: string;
  customer?: Customer | null;
  user: AuthUser;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string | null;
  status: QuickServiceSaleStatus;
  createdAt: string;
  items: Array<{ id: string; description: string; quantity: number; unitPrice: number; subtotal: number }>;
}
