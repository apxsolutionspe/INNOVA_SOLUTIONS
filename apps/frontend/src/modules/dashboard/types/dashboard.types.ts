import { LucideIcon } from 'lucide-react';

export interface DashboardSummary {
  customersCount: number;
  productsCount: number;
  lowStockCount: number;
  inventoryValue: number;
  salesToday: number;
  incomeToday: number;
  incomeMonth: number;
  productsSoldToday: number;
  serviceOrdersPending: number;
  serviceOrdersReady: number;
  serviceOrdersDeliveredToday: number;
  serviceOrdersInProgress: number;
  currentCashStatus: 'OPEN' | 'CLOSED';
  totalCashToday: number;
  totalYapeToday: number;
  totalPlinToday: number;
  totalTransferToday: number;
  expensesToday: number;
  netCashToday: number;
  quickServicesToday: number;
  quickServicesIncomeToday: number;
  topQuickServicesToday: string;
  quickServicesCount: number;
  purchasesToday: number;
  purchasesAmountToday: number;
  pendingPurchases: number;
  suppliersCount: number;
  productsToRestock: number;
  netProfitEstimated: number;
  profitMarginEstimated: number;
  criticalNotifications: number;
  cashDifference: number;
}

export interface KPIStat {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone: 'blue' | 'cyan' | 'violet' | 'green' | 'orange' | 'red' | 'slate';
}

export interface DashboardAlert {
  label: string;
  description: string;
  value: number | string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  icon: LucideIcon;
  path: string;
  isVisible: boolean;
}

export interface QuickAction {
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
}

export interface ChartDatum {
  name: string;
  value: number;
  tone?: string;
}
