export interface Supplier {
  id: string;
  name: string;
  ruc?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactName?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPayload {
  name: string;
  ruc?: string;
  phone?: string;
  email?: string;
  address?: string;
  contactName?: string;
  notes?: string;
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
