import { httpClient } from '../../../services/http-client';

export interface SunatDocument {
  id: string;
  documentType: string;
  series: string;
  number: number;
  customerName: string;
  total: string | number;
  status: string;
  createdAt: string;
}

export interface SunatConfigStatus {
  mode?: string;
  status?: string;
  message?: string;
  ruc?: string | null;
}

export const sunatService = {
  async config() {
    const { data } = await httpClient.get<SunatConfigStatus>('/sunat/config');
    return data;
  },
  async documents() {
    const { data } = await httpClient.get<SunatDocument[]>('/sunat/documents');
    return data;
  },
  async testConnection() {
    const { data } = await httpClient.post('/sunat/test-connection');
    return data;
  },
};
