export type DocumentLookupProvider = 'JSONPE';
export type DocumentLookupSource = 'DNI' | 'RUC';
export type DocumentLookupType = 'DNI' | 'RUC';

export interface JsonpeBaseResponse {
  success?: boolean;
  message?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export type JsonpeDniResponse = JsonpeBaseResponse;
export type JsonpeRucResponse = JsonpeBaseResponse;

export interface JsonpeStatus {
  success: true;
  provider: DocumentLookupProvider;
  configured: boolean;
  dniConfigured: boolean;
  rucConfigured: boolean;
  baseUrl: string;
  timeoutMs: number;
  dniUrl: string;
  rucUrl: string;
  tokenConfigured: boolean;
  tokenLength?: number;
  message?: string;
}

export interface DocumentLookupResult<TData> {
  success: boolean;
  provider: DocumentLookupProvider;
  source: DocumentLookupSource;
  type: DocumentLookupType;
  documentNumber: string;
  message?: string;
  data?: TData;
}

export interface NormalizedDniData {
  dni: string;
  fullName: string;
  firstName: string;
  names: string;
  surnames: string;
  paternalSurname?: string;
  maternalSurname?: string;
  verificationCode?: number;
  address?: string;
  fullAddress?: string;
  ubigeoReniec?: string;
  ubigeoSunat?: string;
  ubigeo?: Array<string | null>;
}

export interface NormalizedRucData {
  ruc: string;
  businessName: string;
  status?: string;
  condition?: string;
  department?: string;
  province?: string;
  district?: string;
  address?: string;
  fullAddress?: string;
  ubigeoSunat?: string;
  ubigeo?: Array<string | null>;
  isRetentionAgent?: boolean;
  isPerceptionAgent?: boolean;
  isFuelPerceptionAgent?: boolean;
  isGoodTaxpayer?: boolean;
}
