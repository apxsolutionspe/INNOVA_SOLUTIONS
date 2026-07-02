import { useCallback, useEffect, useState } from 'react';

import { customersService } from '../services/customers.service';
import { Customer, CustomerPayload, CustomerType } from '../types/customer.types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await customersService.findAll({
        search,
        page: 1,
        limit: 100,
        customerType: customerType || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      });
      setCustomers(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar clientes.');
    } finally {
      setIsLoading(false);
    }
  }, [customerType, search, statusFilter]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const saveCustomer = async (payload: CustomerPayload, id?: string) => {
    setError('');
    const customer = id
      ? await customersService.update(id, payload)
      : await customersService.create(payload);
    setMessage(id ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.');
    await loadCustomers();
    return customer;
  };

  const deactivateCustomer = async (id: string) => {
    setError('');
    await customersService.deactivate(id);
    setMessage('Cliente desactivado correctamente.');
    await loadCustomers();
  };

  const setCustomerStatus = async (id: string, isActive: boolean) => {
    setError('');
    await customersService.setStatus(id, isActive);
    setMessage(isActive ? 'Cliente activado correctamente.' : 'Cliente desactivado correctamente.');
    await loadCustomers();
  };

  return {
    customers,
    selectedCustomer,
    search,
    customerType,
    statusFilter,
    isLoading,
    message,
    error,
    setSearch,
    setCustomerType,
    setStatusFilter,
    setMessage,
    setError,
    setSelectedCustomer,
    saveCustomer,
    deactivateCustomer,
    setCustomerStatus,
    reload: loadCustomers,
  };
}
