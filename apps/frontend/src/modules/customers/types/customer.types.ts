export type CustomerType = 'NATURAL' | 'COMPANY';
export type DocumentType = 'DNI' | 'RUC' | 'CE' | 'PASSPORT' | 'OTHER';

export interface Customer {
  id: string;
  customerType: CustomerType;
  documentType: DocumentType;
  documentNumber: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  businessName?: string | null;
  tradeName?: string | null;
  legalRepresentative?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  businessLine?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPayload {
  customerType: CustomerType;
  documentType: DocumentType;
  documentNumber: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  tradeName?: string;
  legalRepresentative?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessLine?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CustomerQuery {
  search?: string;
  page?: number;
  limit?: number;
  customerType?: CustomerType;
  isActive?: boolean;
}

export interface CustomersResponse {
  items: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
