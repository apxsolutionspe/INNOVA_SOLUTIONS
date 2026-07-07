export type InventoryMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  barcode?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  imagePath?: string | null;
  thumbnail?: string | null;
  categoryId: string;
  category: ProductCategory;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  isActive: boolean;
}

export interface ProductPayload {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  imageUrl?: string | null;
  categoryId: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
}

export interface ProductsResponse {
  items: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdjustStockPayload {
  type: InventoryMovementType;
  quantity: number;
  reason: string;
}
