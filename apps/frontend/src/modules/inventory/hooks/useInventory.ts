import { useCallback, useEffect, useMemo, useState } from 'react';

import { inventoryService } from '../services/inventory.service';
import { AdjustStockPayload, Product, ProductCategory, ProductPayload } from '../types/inventory.types';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const [productsResponse, categoriesResponse, lowStockResponse] = await Promise.all([
        inventoryService.findProducts({ search, categoryId: categoryId || undefined, page: 1, limit: 50 }),
        inventoryService.findCategories(),
        inventoryService.findLowStock(),
      ]);
      setProducts(productsResponse.items);
      setCategories(categoriesResponse);
      setLowStockProducts(lowStockResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar inventario.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, search]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const summary = useMemo(() => {
    const inventoryValue = products.reduce(
      (total, product) => total + product.purchasePrice * product.stock,
      0,
    );

    return {
      productsCount: products.length,
      categoriesCount: categories.length,
      lowStockCount: lowStockProducts.length,
      inventoryValue,
    };
  }, [categories.length, lowStockProducts.length, products]);

  const saveProduct = async (payload: ProductPayload, id?: string) => {
    id
      ? await inventoryService.updateProduct(id, payload)
      : await inventoryService.createProduct(payload);
    setMessage(id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
    await loadInventory();
  };

  const deactivateProduct = async (id: string) => {
    await inventoryService.deactivateProduct(id);
    setMessage('Producto desactivado correctamente.');
    await loadInventory();
  };

  const createCategory = async (payload: { name: string; description?: string }) => {
    await inventoryService.createCategory(payload);
    setMessage('Categoria creada correctamente.');
    await loadInventory();
  };

  const adjustStock = async (id: string, payload: AdjustStockPayload) => {
    await inventoryService.adjustStock(id, payload);
    setMessage('Stock ajustado correctamente.');
    await loadInventory();
  };

  return {
    products,
    categories,
    lowStockProducts,
    search,
    categoryId,
    isLoading,
    message,
    error,
    summary,
    setSearch,
    setCategoryId,
    setMessage,
    setError,
    saveProduct,
    deactivateProduct,
    createCategory,
    adjustStock,
  };
}
