export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentMethod?: string;
  categoryId?: string;
  productId?: string;
  supplierId?: string;
}

export interface NameValue {
  name: string;
  value?: number;
  total?: number;
  amount?: number;
  quantity?: number;
  count?: number;
  method?: string;
}

export interface ReportsSummary {
  totalSales: number;
  totalSalesAmount: number;
  totalQuickServicesAmount: number;
  totalServiceOrdersAmount: number;
  totalPurchasesAmount: number;
  totalExpenses: number;
  netIncome: number;
  productsLowStock: number;
  pendingServiceOrders: number;
  pendingPurchases: number;
  topProducts: NameValue[];
  topQuickServices: NameValue[];
  paymentMethodSummary: NameValue[];
}

export interface SalesReport {
  salesByDate: Array<{ date: string; total: number }>;
  salesCount: number;
  totalSold: number;
  cancelledSales: number;
  topProducts: NameValue[];
  salesByPaymentMethod: NameValue[];
  salesByUser: NameValue[];
  averageTicket: number;
}

export interface InventoryReport {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inventoryValue: number;
  movements: Array<{ id: string; product: string; type: string; quantity: number; reason: string; createdAt: string }>;
  topRotationProducts: NameValue[];
}

export interface ServiceOrdersReport {
  ordersByStatus: NameValue[];
  receivedOrders: number;
  inProgressOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  serviceOrderIncome: number;
  averageAttentionHours: number;
  responsibleUsers: NameValue[];
}

export interface QuickServicesReport {
  totalQuickServices: number;
  quickServicesIncome: number;
  topQuickServices: NameValue[];
  incomeByCategory: NameValue[];
  paymentMethods: NameValue[];
  cancelledOperations: number;
}

export interface PurchasesReport {
  purchasesByPeriod: Array<{ date: string; total: number }>;
  totalPurchasedAmount: number;
  pendingPurchases: number;
  receivedPurchases: number;
  topSuppliers: NameValue[];
  topPurchasedProducts: NameValue[];
  purchasesByPaymentStatus: NameValue[];
}

export interface CashReport {
  openSessions: number;
  closedSessions: number;
  totalCash: number;
  totalYape: number;
  totalPlin: number;
  totalTransfer: number;
  income: number;
  expenses: number;
  cashDifference: number;
  movementsByUser: NameValue[];
  dailyClosing: Array<{ code: string; user: string; status: string; difference: number }>;
}

export interface ProfitabilityReport {
  totalIncome: number;
  estimatedCosts: number;
  registeredExpenses: number;
  estimatedGrossProfit: number;
  estimatedMargin: number;
  mostProfitableProducts: NameValue[];
  mostProfitableQuickServices: NameValue[];
}
