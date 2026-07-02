import type { AuthUser } from '../../../types/auth';
import type { Customer } from '../../customers/types/customer.types';
import type { Product } from '../../inventory/types/inventory.types';
import type { PaymentMethod } from '../../pos/types/pos.types';

export type SaleStatus = 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING';

export interface SaleItem {
  id: string;
  productId?: string | null;
  product?: Product | null;
  itemType: 'PRODUCT' | 'SERVICE';
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  total: number;
}

export interface SalePayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string | null;
}

export interface Sale {
  id: string;
  code: string;
  customer?: Customer | null;
  user: AuthUser;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  applyIgv: boolean;
  igvRate: number;
  paymentStatus: PaymentStatus;
  status: SaleStatus;
  notes?: string | null;
  createdAt: string;
  items: SaleItem[];
  payments: SalePayment[];
}

export interface SalesResponse {
  items: Sale[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
