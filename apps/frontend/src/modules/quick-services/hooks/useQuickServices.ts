import { useEffect, useMemo, useState } from 'react';
import { cashService } from '../../cash/services/cash.service';
import { CashSession } from '../../cash/types/cash.types';
import { customersService } from '../../customers/services/customers.service';
import { Customer } from '../../customers/types/customer.types';
import { quickServicesService } from '../services/quick-services.service';
import { calculateQuickServiceTotal } from '../utils/quick-service-calculations';
import { PaymentMethod, QuickService, QuickServiceCartItem, QuickServiceCategory, QuickServiceSale } from '../types/quick-service.types';

export function useQuickServices() {
  const [categories, setCategories] = useState<QuickServiceCategory[]>([]);
  const [services, setServices] = useState<QuickService[]>([]);
  const [allServices, setAllServices] = useState<QuickService[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<QuickServiceSale[]>([]);
  const [cashSession, setCashSession] = useState<CashSession | null>(null);
  const [cart, setCart] = useState<QuickServiceCartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [discount, setDiscount] = useState(0);
  const [successSale, setSuccessSale] = useState<QuickServiceSale | null>(null);
  const [receipt, setReceipt] = useState<{ sale: QuickServiceSale; html: string } | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const totals = useMemo(() => calculateQuickServiceTotal(cart, discount), [cart, discount]);

  const reload = async () => {
    setIsLoading(true);
    try {
      const [categoryData, allServiceData, serviceData, customerData, saleData, currentCash] = await Promise.all([
        quickServicesService.categories(),
        quickServicesService.services(),
        quickServicesService.services({ search, categoryId: categoryId || undefined }),
        customersService.findAll({ page: 1, limit: 100 }),
        quickServicesService.sales(),
        cashService.current(),
      ]);
      setCategories(categoryData);
      setAllServices(allServiceData);
      setServices(serviceData);
      setCustomers(customerData.items);
      setSales(saleData);
      setCashSession(currentCash);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => { void reload().catch((e) => setError(e.message)); }, [search, categoryId]);

  const add = (service: QuickService, quantity = 1, option?: string, notes?: string) => {
    setError('');
    const safeQuantity = Math.max(1, Number.isFinite(quantity) ? quantity : 1);
    setCart((items) =>
      items.some((i) => i.service.id === service.id)
        ? items.map((i) =>
            i.service.id === service.id
              ? { ...i, quantity: i.quantity + safeQuantity, option: option ?? i.option, notes: notes ?? i.notes }
              : i,
          )
        : [...items, { service, quantity: safeQuantity, option, notes }],
    );
  };
  const qty = (id: string, quantity: number) => {
    setError('');
    setCart((items) => items.map((i) => i.service.id === id ? { ...i, quantity: Math.max(1, Number.isFinite(quantity) ? quantity : 1) } : i));
  };
  const remove = (id: string) => setCart((items) => items.filter((i) => i.service.id !== id));
  const confirm = async () => {
    setError('');
    if (!cashSession) {
      setError('Debe abrir caja antes de registrar servicios rapidos.');
      return;
    }
    if (!cart.length) {
      setError('Agrega servicios al carrito antes de confirmar.');
      return;
    }
    if (cart.some((item) => item.quantity <= 0)) {
      setError('Las cantidades deben ser mayores a cero.');
      return;
    }
    if (discount < 0 || discount > totals.subtotal) {
      setError('El descuento no puede ser negativo ni superar el subtotal.');
      return;
    }
    if (paymentMethod !== 'CASH' && !paymentReference.trim()) {
      setError('Los pagos digitales o por transferencia requieren referencia.');
      return;
    }
    setIsSaving(true);
    try {
      const sale = await quickServicesService.createSale({ customerId: selectedCustomer?.id, items: cart.map((i) => ({ quickServiceId: i.service.id, quantity: i.quantity })), discount, paymentMethod, paymentReference });
      setSuccessSale(sale);
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
      setPaymentReference('');
      setPaymentMethod('CASH');
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar operacion.');
    } finally {
      setIsSaving(false);
    }
  };
  const loadReceipt = async (id: string) => setReceipt(await quickServicesService.receipt(id));
  return { categories, services, allServices, customers, sales, cashSession, cart, selectedCustomer, search, categoryId, paymentMethod, paymentReference, discount, totals, successSale, receipt, error, isLoading, isSaving, setSearch, setCategoryId, setSelectedCustomer, setPaymentMethod, setPaymentReference, setDiscount, setSuccessSale, setReceipt, setError, add, qty, remove, clearCart: () => setCart([]), confirm, loadReceipt, reload };
}
