import { httpClient } from './http-client';

export interface DniLookupData {
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

export interface RucLookupData {
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

export interface DocumentLookupResponse<TData> {
  success: boolean;
  provider: 'JSONPE';
  source: 'DNI' | 'RUC';
  type: 'DNI' | 'RUC';
  documentNumber: string;
  message?: string;
  data?: TData;
}

export interface DocumentLookupStatus {
  success: true;
  provider: 'JSONPE';
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

export const documentLookupService = {
  async getDocumentLookupStatus() {
    const { data } = await httpClient.get<DocumentLookupStatus>('/document-lookup/status');
    return data;
  },

  async lookupDni(dni: string) {
    const { data } = await httpClient.get<DocumentLookupResponse<DniLookupData>>(`/document-lookup/dni/${dni}`);
    return data;
  },

  async lookupRuc(ruc: string) {
    const { data } = await httpClient.get<DocumentLookupResponse<RucLookupData>>(`/document-lookup/ruc/${ruc}`);
    return data;
  },
};
