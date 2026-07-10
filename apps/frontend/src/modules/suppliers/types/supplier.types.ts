import type { Product } from '../../inventory/types/inventory.types';

export interface SupplierProduct {
  id: string;
  supplierId: string;
  productId?: string | null;
  product?: Product | null;
  name: string;
  category?: string | null;
  unit?: string | null;
  supplierSku?: string | null;
  referencePrice?: number | null;
  lastCost?: number | null;
  minOrderQuantity?: number | null;
  deliveryTime?: string | null;
  leadTime?: string | null;
  availability?: string | null;
  notes?: string | null;
  isPreferred?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProductPayload {
  productId?: string;
  name: string;
  category?: string;
  unit?: string;
  supplierSku?: string;
  referencePrice?: number;
  lastCost?: number;
  minOrderQuantity?: number;
  deliveryTime?: string;
  leadTime?: string;
  availability?: string;
  notes?: string;
  isPreferred?: boolean;
  isActive?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  ruc?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  reference?: string;
  contactName?: string;
  contactRole?: string;
  sunatStatus?: string;
  sunatCondition?: string;
  notes?: string;
  isActive: boolean;
  products: SupplierProduct[];
  _count?: { purchaseOrders: number };
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPayload {
  name: string;
  ruc?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  reference?: string;
  contactName?: string;
  contactRole?: string;
  sunatStatus?: string;
  sunatCondition?: string;
  notes?: string;
  products?: SupplierProductPayload[];
}

export interface SuppliersResponse {
  items: Supplier[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
