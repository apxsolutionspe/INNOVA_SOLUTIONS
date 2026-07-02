import { httpClient } from '../../../services/http-client';

export interface WhatsappMessageLog {
  id: string;
  phone: string;
  messageType: string;
  templateName?: string | null;
  content: string;
  status: string;
  createdAt: string;
}

export const whatsappService = {
  async messages() {
    const { data } = await httpClient.get<WhatsappMessageLog[]>('/whatsapp/messages');
    return data;
  },
  async testConnection() {
    const { data } = await httpClient.post('/whatsapp/test-connection');
    return data;
  },
};
