import { httpClient } from '../../../services/http-client';
import {
  AdjustStockPayload,
  Product,
  ProductCategory,
  ProductPayload,
  ProductsResponse,
} from '../types/inventory.types';

export const inventoryService = {
  async findProducts(params: { search?: string; categoryId?: string; page?: number; limit?: number }) {
    const { data } = await httpClient.get<ProductsResponse>('/inventory/products', { params });
    return data;
  },

  async createProduct(payload: ProductPayload) {
    const { data } = await httpClient.post<Product>('/inventory/products', payload);
    return data;
  },

  async updateProduct(id: string, payload: Partial<ProductPayload>) {
    const { data } = await httpClient.patch<Product>(`/inventory/products/${id}`, payload);
    return data;
  },

  async deactivateProduct(id: string) {
    const { data } = await httpClient.delete<Product>(`/inventory/products/${id}`);
    return data;
  },

  async adjustStock(id: string, payload: AdjustStockPayload) {
    const { data } = await httpClient.post<Product>(`/inventory/products/${id}/adjust-stock`, payload);
    return data;
  },

  async findCategories() {
    const { data } = await httpClient.get<ProductCategory[]>('/inventory/categories');
    return data;
  },

  async createCategory(payload: { name: string; description?: string }) {
    const { data } = await httpClient.post<ProductCategory>('/inventory/categories', payload);
    return data;
  },

  async findLowStock() {
    const { data } = await httpClient.get<Product[]>('/inventory/low-stock');
    return data;
  },
};
