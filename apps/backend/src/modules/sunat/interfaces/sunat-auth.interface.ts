export interface SunatAuthContext {
  mode: 'mock' | 'sandbox' | 'production';
  ruc?: string;
  token?: string;
}
