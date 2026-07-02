import { httpClient } from '../../../services/http-client';
import { ProductsResponse } from '../../inventory/types/inventory.types';
import { CreateSalePayload, SaleReceipt } from '../types/pos.types';
import { Sale } from '../../sales/types/sale.types';

export const posService = {
  async searchProducts(search: string) {
    const { data } = await httpClient.get<ProductsResponse>('/inventory/products', {
      params: { search, page: 1, limit: 24 },
    });
    return data.items;
  },

  async createSale(payload: CreateSalePayload) {
    const { data } = await httpClient.post<Sale>('/sales', payload);
    return data;
  },

  async getReceipt(id: string) {
    const { data } = await httpClient.get<SaleReceipt>(`/sales/${id}/receipt`);
    return data;
  },
};
