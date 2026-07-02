export interface ProfitabilitySummary {
  totalIncome: number;
  productCosts: number;
  quickServiceCosts: number;
  registeredExpenses: number;
  grossProfit: number;
  estimatedNetProfit: number;
  profitMargin: number;
  warnings: string[];
}

export interface ProfitItem {
  name: string;
  income: number;
  cost: number;
  quantity: number;
  profit: number;
  margin: number;
}

export interface MonthlyProfit {
  month: string;
  income: number;
  costs: number;
  expenses: number;
  profit: number;
}
