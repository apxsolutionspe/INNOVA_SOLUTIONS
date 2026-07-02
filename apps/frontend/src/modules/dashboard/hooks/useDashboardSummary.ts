import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboard.service';
import { DashboardSummary } from '../types/dashboard.types';

export const emptyDashboardSummary: DashboardSummary = {
  customersCount: 0,
  productsCount: 0,
  lowStockCount: 0,
  inventoryValue: 0,
  salesToday: 0,
  incomeToday: 0,
  incomeMonth: 0,
  productsSoldToday: 0,
  serviceOrdersPending: 0,
  serviceOrdersReady: 0,
  serviceOrdersDeliveredToday: 0,
  serviceOrdersInProgress: 0,
  currentCashStatus: 'CLOSED',
  totalCashToday: 0,
  totalYapeToday: 0,
  totalPlinToday: 0,
  totalTransferToday: 0,
  expensesToday: 0,
  netCashToday: 0,
  quickServicesToday: 0,
  quickServicesIncomeToday: 0,
  topQuickServicesToday: 'Sin datos',
  quickServicesCount: 0,
  purchasesToday: 0,
  purchasesAmountToday: 0,
  pendingPurchases: 0,
  suppliersCount: 0,
  productsToRestock: 0,
  netProfitEstimated: 0,
  profitMarginEstimated: 0,
  criticalNotifications: 0,
  cashDifference: 0,
};

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary>(emptyDashboardSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setSummary(await dashboardService.summary());
    } catch (summaryError) {
      setError(summaryError instanceof Error ? summaryError.message : 'No se pudo cargar el resumen.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return { summary, isLoading, error, refresh: loadSummary };
}
