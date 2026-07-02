export interface BusinessSettings {
  id: string;
  businessName: string;
  ruc?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  currency: string;
  applyIgv: boolean;
  taxPercentage: number;
  yapeNumber?: string;
  plinNumber?: string;
  bankAccount?: string;
  receiptMessage?: string;
}

export interface TaxSettings {
  applyIgv: boolean;
  taxPercentage: number;
  igvRate: number;
}
