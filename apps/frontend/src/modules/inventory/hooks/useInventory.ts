import { useCallback, useEffect, useMemo, useState } from 'react';

import { inventoryService } from '../services/inventory.service';
import { AdjustStockPayload, Product, ProductCategory, ProductPayload } from '../types/inventory.types';
import {
  buildProductCategoryOptions,
  matchesProductCategory,
  matchesProductSearch,
} from '../utils/category-normalization';

export function useInventory() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
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
        inventoryService.findProducts({ page: 1, limit: 100 }),
        inventoryService.findCategories(),
        inventoryService.findLowStock(),
      ]);
      setAllProducts(productsResponse.items);
      setCategories(categoriesResponse);
      setLowStockProducts(lowStockResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar inventario.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const categoryOptions = useMemo(
    () => buildProductCategoryOptions(categories, allProducts),
    [allProducts, categories],
  );

  const selectedCategory = useMemo(
    () => categoryOptions.find((category) => category.id === categoryId) ?? null,
    [categoryId, categoryOptions],
  );

  useEffect(() => {
    if (categoryId && !selectedCategory) {
      setCategoryId('');
    }
  }, [categoryId, selectedCategory]);

  const products = useMemo(
    () =>
      allProducts.filter(
        (product) =>
          matchesProductCategory(product, selectedCategory) &&
          matchesProductSearch(product, search),
      ),
    [allProducts, search, selectedCategory],
  );

  const summary = useMemo(() => {
    const inventoryValue = allProducts.reduce(
      (total, product) => total + product.purchasePrice * product.stock,
      0,
    );

    return {
      productsCount: allProducts.length,
      categoriesCount: categoryOptions.length,
      lowStockCount: lowStockProducts.length,
      inventoryValue,
    };
  }, [allProducts, categoryOptions.length, lowStockProducts.length]);

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
    categories: categoryOptions,
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
