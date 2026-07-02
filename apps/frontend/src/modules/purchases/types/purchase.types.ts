import { Product } from '../../inventory/types/inventory.types';
import { Supplier } from '../../suppliers/types/supplier.types';

export type PurchaseOrderStatus = 'PENDING' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
export type PurchasePaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL';
export type PaymentMethod = 'CASH' | 'YAPE' | 'PLIN' | 'TRANSFER';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierId: string;
  supplier: Supplier;
  user: { id: string; fullName: string; email: string };
  status: PurchaseOrderStatus;
  subtotal: number;
  taxTotal: number;
  discount: number;
  total: number;
  paymentStatus: PurchasePaymentStatus;
  paymentMethod?: PaymentMethod;
  reference?: string;
  expectedDate?: string;
  receivedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItem[];
}

export interface PurchasePayload {
  supplierId: string;
  items: Array<{ productId: string; quantity: number; unitCost: number }>;
  discount?: number;
  paymentStatus: PurchasePaymentStatus;
  paymentMethod?: PaymentMethod;
  reference?: string;
  expectedDate?: string;
  payFromCash?: boolean;
  notes?: string;
}

export interface PurchasesResponse {
  items: PurchaseOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
