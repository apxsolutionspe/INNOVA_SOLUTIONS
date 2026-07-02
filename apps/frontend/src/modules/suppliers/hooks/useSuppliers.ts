import { useCallback, useEffect, useState } from 'react';

import { Supplier, SupplierPayload } from '../types/supplier.types';
import { suppliersService } from '../services/suppliers.service';

export function useSuppliers(limit = 20) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await suppliersService.findAll({ search, limit });
      setSuppliers(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los proveedores.');
    } finally {
      setIsLoading(false);
    }
  }, [limit, search]);

  useEffect(() => {
    void loadSuppliers();
  }, [loadSuppliers]);

  const saveSupplier = async (payload: SupplierPayload, id?: string) => {
    setError('');
    const supplier = id ? await suppliersService.update(id, payload) : await suppliersService.create(payload);
    setMessage(id ? 'Proveedor actualizado correctamente.' : 'Proveedor registrado correctamente.');
    await loadSuppliers();
    return supplier;
  };

  const deactivateSupplier = async (id: string) => {
    setError('');
    await suppliersService.deactivate(id);
    setMessage('Proveedor desactivado correctamente.');
    await loadSuppliers();
  };

  return {
    suppliers,
    selectedSupplier,
    setSelectedSupplier,
    search,
    setSearch,
    isLoading,
    message,
    error,
    loadSuppliers,
    saveSupplier,
    deactivateSupplier,
  };
}
