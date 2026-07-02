import { useCallback, useEffect, useState } from 'react';

import { reportsService } from '../services/reports.service';
import {
  CashReport,
  InventoryReport,
  ProfitabilityReport,
  PurchasesReport,
  QuickServicesReport,
  ReportFilters,
  ReportsSummary,
  SalesReport,
  ServiceOrdersReport,
} from '../types/report.types';

export function useReports() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [inventory, setInventory] = useState<InventoryReport | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrdersReport | null>(null);
  const [quickServices, setQuickServices] = useState<QuickServicesReport | null>(null);
  const [purchases, setPurchases] = useState<PurchasesReport | null>(null);
  const [cash, setCash] = useState<CashReport | null>(null);
  const [profitability, setProfitability] = useState<ProfitabilityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [summaryData, salesData, inventoryData, serviceOrdersData, quickServicesData, purchasesData, cashData, profitabilityData] = await Promise.all([
        reportsService.summary(filters),
        reportsService.sales(filters),
        reportsService.inventory(filters),
        reportsService.serviceOrders(filters),
        reportsService.quickServices(filters),
        reportsService.purchases(filters),
        reportsService.cash(filters),
        reportsService.profitability(filters),
      ]);
      setSummary(summaryData);
      setSales(salesData);
      setInventory(inventoryData);
      setServiceOrders(serviceOrdersData);
      setQuickServices(quickServicesData);
      setPurchases(purchasesData);
      setCash(cashData);
      setProfitability(profitabilityData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los reportes.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const exportReport = async (module: 'sales' | 'inventory' | 'cash', type: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      await reportsService.export(module, type, filters);
    } finally {
      setIsExporting(false);
    }
  };

  return { filters, setFilters, summary, sales, inventory, serviceOrders, quickServices, purchases, cash, profitability, isLoading, isExporting, error, loadReports, exportReport };
}
