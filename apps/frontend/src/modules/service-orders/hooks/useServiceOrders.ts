import { useCallback, useEffect, useState } from 'react';

import { serviceOrdersService } from '../services/service-orders.service';
import { ServiceOrder, ServiceOrderStatus } from '../types/service-order.types';

export function useServiceOrders() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await serviceOrdersService.findAll({ search, status, page: 1, limit: 50 });
      setOrders(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar ordenes.');
    } finally {
      setIsLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const stats = {
    pending: orders.filter((order) => ['RECEIVED', 'DIAGNOSIS'].includes(order.status)).length,
    inProgress: orders.filter((order) => order.status === 'IN_PROGRESS').length,
    ready: orders.filter((order) => order.status === 'READY').length,
    deliveredToday: orders.filter((order) => order.status === 'DELIVERED' && order.deliveredAt?.startsWith(new Date().toISOString().slice(0, 10))).length,
  };

  return { orders, search, status: status as ServiceOrderStatus | '', isLoading, error, stats, setSearch, setStatus, reload: loadOrders };
}
