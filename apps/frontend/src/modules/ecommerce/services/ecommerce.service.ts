import { httpClient } from '../../../services/http-client';

export interface EcommerceProduct {
  id: string;
  name: string;
  sku: string;
  imageUrl?: string | null;
  image?: string | null;
  imagePath?: string | null;
  thumbnail?: string | null;
  stock: number;
  salePrice: number;
  category?: { name: string };
}

export interface OnlineOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: { name: string };
}

export interface OnlineOrder {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  subtotal: number;
  deliveryCost: number;
  total: number;
  createdAt: string;
  items?: OnlineOrderItem[];
}

export const ecommerceService = {
  async products() {
    const { data } = await httpClient.get<EcommerceProduct[]>('/ecommerce/products');
    return data;
  },
  async orders() {
    const { data } = await httpClient.get<OnlineOrder[]>('/ecommerce/orders');
    return data;
  },
  async updateOrderStatus(id: string, status: string) {
    const { data } = await httpClient.patch<OnlineOrder>(`/ecommerce/orders/${id}/status`, { status });
    return data;
  },
};
