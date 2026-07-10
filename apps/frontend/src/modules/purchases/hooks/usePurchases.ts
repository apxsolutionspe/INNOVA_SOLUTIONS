import { useCallback, useEffect, useState } from 'react';

import { PurchaseOrder, PurchaseOrderStatus, PurchasePayload } from '../types/purchase.types';
import { purchasesService } from '../services/purchases.service';

export function usePurchases(limit = 20) {
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PurchaseOrderStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPurchases = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await purchasesService.findAll({ search, status: status || undefined, limit });
      setPurchases(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las compras.');
    } finally {
      setIsLoading(false);
    }
  }, [limit, search, status]);

  useEffect(() => {
    void loadPurchases();
  }, [loadPurchases]);

  const createPurchase = async (payload: PurchasePayload) => {
    const purchase = await purchasesService.create(payload);
    setMessage('Orden de compra registrada correctamente.');
    await loadPurchases();
    return purchase;
  };

  const receivePurchase = async (id: string, items?: Array<{ itemId: string; receivedQuantity: number }>, notes?: string) => {
    const purchase = await purchasesService.receive(id, { items, notes });
    setMessage('Recepción registrada y stock actualizado.');
    await loadPurchases();
    return purchase;
  };

  const cancelPurchase = async (id: string, reason: string) => {
    const purchase = await purchasesService.cancel(id, reason);
    setMessage('Orden de compra cancelada.');
    await loadPurchases();
    return purchase;
  };

  return { purchases, search, setSearch, status, setStatus, isLoading, message, error, loadPurchases, createPurchase, receivePurchase, cancelPurchase };
}
