import type { Customer } from '../../customers/types/customer.types';
import type { Product } from '../../inventory/types/inventory.types';
import type { Sale } from '../../sales/types/sale.types';

export type PaymentMethod = 'CASH' | 'YAPE' | 'PLIN' | 'TRANSFER' | 'MIXED';

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export interface PaymentInput {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface SalePreviewTotals {
  subtotal: number;
  discountTotal: number;
  taxableBase: number;
  taxTotal: number;
  total: number;
  paid: number;
  pending: number;
  change: number;
  applyIgv: boolean;
  igvRate: number;
}

export interface CreateSalePayload {
  customerId?: string;
  items: Array<{
    productId: string;
    itemType: 'PRODUCT';
    quantity: number;
    discount: number;
  }>;
  payments: PaymentInput[];
  notes?: string;
}

export interface SaleReceipt {
  sale: Sale;
  html: string;
}

export interface PosState {
  selectedCustomer: Customer | null;
  cart: CartItem[];
}
