export interface SunatDocument {
  id: string;
  type: 'BOLETA' | 'FACTURA' | 'NOTA_CREDITO' | 'NOTA_DEBITO';
  status: 'MOCK_CREATED' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message: string;
}
