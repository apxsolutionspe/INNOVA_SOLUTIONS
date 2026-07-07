import { useCallback, useEffect, useMemo, useState } from 'react';

import { customersService } from '../../customers/services/customers.service';
import { cashService } from '../../cash/services/cash.service';
import { CashSession } from '../../cash/types/cash.types';
import { Customer } from '../../customers/types/customer.types';
import { Product, ProductCategory } from '../../inventory/types/inventory.types';
import {
  buildProductCategoryOptions,
  matchesProductCategory,
} from '../../inventory/utils/category-normalization';
import { calculateSalePreview } from '../utils/sale-calculations';
import { posService } from '../services/pos.service';
import { CartItem, PaymentInput, SaleReceipt } from '../types/pos.types';
import { Sale } from '../../sales/types/sale.types';
import { settingsService } from '../../settings/services/settings.service';
import { TaxSettings } from '../../settings/types/settings.types';

export function usePOS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [payments, setPayments] = useState<PaymentInput[]>([
    { method: 'CASH', amount: 0, reference: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successSale, setSuccessSale] = useState<Sale | null>(null);
  const [receipt, setReceipt] = useState<SaleReceipt | null>(null);
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({ applyIgv: false, taxPercentage: 18, igvRate: 0.18 });

  const totals = useMemo(() => calculateSalePreview(cart, payments, taxSettings), [cart, payments, taxSettings]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsResponse, customersResponse, currentCash, currentTaxSettings] = await Promise.all([
        posService.searchProducts(search),
        customersService.findAll({ page: 1, limit: 50 }),
        cashService.current(),
        settingsService.tax(),
      ]);
      setProducts(productsResponse);
      setCart((current) =>
        current
          .map((item) => {
            const freshProduct = productsResponse.find((product) => product.id === item.product.id);
            if (!freshProduct) return item;
            return {
              ...item,
              product: freshProduct,
              quantity: Math.min(item.quantity, Math.max(freshProduct.stock, 0)),
            };
          })
          .filter((item): item is CartItem => Boolean(item) && item.quantity > 0),
      );
      setCustomers(customersResponse.items);
      setCashSession(currentCash);
      setTaxSettings(currentTaxSettings);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar POS.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const categories = useMemo(() => {
    const productCategories = products
      .map((product) => product.category)
      .filter((category): category is ProductCategory => Boolean(category?.id));

    return buildProductCategoryOptions(productCategories, products);
  }, [products]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  useEffect(() => {
    if (selectedCategoryId && !selectedCategory) {
      setSelectedCategoryId('');
    }
  }, [selectedCategory, selectedCategoryId]);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => matchesProductCategory(product, selectedCategory));
  }, [products, selectedCategory]);

  const cartQuantities = useMemo(() => {
    return cart.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.product.id] = item.quantity;
      return accumulator;
    }, {});
  }, [cart]);

  const addProduct = (product: Product, quantity = 1) => {
    setError('');
    if (product.stock <= 0) {
      setError('Este producto no tiene stock disponible.');
      return;
    }
    const quantityToAdd = Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1));
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQuantity = existing.quantity + quantityToAdd;
        if (nextQuantity > product.stock) {
          setError('Stock maximo disponible alcanzado.');
          return current;
        }
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQuantity } : item,
        );
      }
      return [...current, { product, quantity: Math.min(quantityToAdd, product.stock), discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setError('');
    setCart((current) =>
      current.map((item) => {
        if (item.product.id !== productId) return item;
        const nextQuantity = Math.max(1, Number.isFinite(quantity) ? Math.floor(quantity) : 1);
        if (nextQuantity > item.product.stock) {
          setError('Stock maximo disponible alcanzado.');
        }
        return { ...item, quantity: Math.min(nextQuantity, item.product.stock) };
      }),
    );
  };

  const removeProduct = (productId: string) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  const confirmSale = async () => {
    setError('');
    if (!cart.length) {
      setError('Agrega productos al carrito antes de vender.');
      return;
    }
    const unavailableItem = cart.find((item) => item.product.stock <= 0);
    if (unavailableItem) {
      setError(`${unavailableItem.product.name} no tiene stock disponible.`);
      return;
    }
    const overStockItem = cart.find((item) => item.quantity > item.product.stock);
    if (overStockItem) {
      setError(`La cantidad de ${overStockItem.product.name} supera el stock disponible.`);
      return;
    }
    if (!cashSession || cashSession.status !== 'OPEN') {
      setError('Debe abrir caja antes de registrar ventas.');
      return;
    }
    if (totals.total <= 0) {
      setError('El total de la venta debe ser mayor a cero.');
      return;
    }
    const validPayments = payments
      .filter((payment) => Number(payment.amount) > 0)
      .map((payment) => ({ ...payment, reference: payment.reference?.trim() }));

    if (!validPayments.length) {
      setError('Registra al menos un pago valido para confirmar la venta.');
      return;
    }
    if (totals.paid < totals.total) {
      setError('El monto pagado no cubre el total de la venta.');
      return;
    }
    const missingReference = validPayments.find((payment) => payment.method !== 'CASH' && !payment.reference);
    if (missingReference) {
      setError('Los pagos digitales o por transferencia requieren referencia.');
      return;
    }

    setIsSaving(true);
    try {
      const sale = await posService.createSale({
        customerId: selectedCustomer?.id,
        items: cart.map((item) => ({
          productId: item.product.id,
          itemType: 'PRODUCT',
          quantity: item.quantity,
          discount: item.discount,
        })),
        payments: validPayments,
      });
      setSuccessSale(sale);
      setCart([]);
      setSelectedCustomer(null);
      setPayments([{ method: 'CASH', amount: 0, reference: '' }]);
      await loadInitialData();
    } catch (saleError) {
      setError(saleError instanceof Error ? saleError.message : 'No se pudo registrar la venta.');
      await loadInitialData();
    } finally {
      setIsSaving(false);
    }
  };

  const loadReceipt = async (saleId: string) => {
    const data = await posService.getReceipt(saleId);
    setReceipt(data);
  };

  return {
    products,
    visibleProducts,
    categories,
    selectedCategoryId,
    cartQuantities,
    customers,
    cart,
    selectedCustomer,
    search,
    payments,
    totals,
    isLoading,
    isSaving,
    error,
    successSale,
    receipt,
    cashSession,
    taxSettings,
    setSearch,
    setSelectedCategoryId,
    setSelectedCustomer,
    setPayments,
    setSuccessSale,
    setReceipt,
    addProduct,
    updateQuantity,
    removeProduct,
    clearCart: () => setCart([]),
    confirmSale,
    loadReceipt,
    refresh: loadInitialData,
  };
}
