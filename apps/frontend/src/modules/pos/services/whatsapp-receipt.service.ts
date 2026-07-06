import { httpClient } from '../../../services/http-client';

export interface SendSaleReceiptPayload {
  saleId: string;
  phone: string;
  sendPdf?: boolean;
  documentType?: 'COMPROBANTE' | 'BOLETA_PRUEBA' | 'FACTURA_PRUEBA';
  sendStrategy?: 'template_test' | 'receipt_template' | 'receipt_pdf' | 'text' | 'document' | 'auto';
  mode?: 'template_test' | 'receipt_template' | 'receipt_pdf' | 'text' | 'document' | 'auto';
}

export interface SendSaleReceiptResponse {
  success: boolean;
  message: string;
  error?: string;
  data: {
    saleId: string;
    phone: string;
    mode: 'MOCK' | 'REAL' | string;
    strategy?: string;
    templateName?: string;
    status: 'SENT' | 'ERROR' | string;
    providerMessageId?: string;
    mediaId?: string;
    errorMessage?: string;
  };
}

export interface CreateReceiptLinkPayload {
  type: 'SALE' | 'SERVICE_ORDER' | 'QUICK_SERVICE';
  id: string;
  phone?: string;
}

export interface CreateReceiptLinkResponse {
  success: boolean;
  receiptUrl: string;
  whatsappUrl: string;
  message: string;
  data: {
    type: CreateReceiptLinkPayload['type'];
    id: string;
    code: string;
    phone: string;
    customerName: string;
    total: number;
  };
}

export const whatsappReceiptService = {
  async sendSaleReceipt(payload: SendSaleReceiptPayload) {
    const { data } = await httpClient.post<SendSaleReceiptResponse>('/whatsapp/send-sale-receipt', payload);
    return data;
  },
  async createReceiptLink(payload: CreateReceiptLinkPayload) {
    const { data } = await httpClient.post<CreateReceiptLinkResponse>('/whatsapp/receipt-link', payload);
    return data;
  },
};
