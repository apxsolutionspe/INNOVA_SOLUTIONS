export class ProfitabilitySummaryDto {
  totalIncome!: number;
  productCosts!: number;
  quickServiceCosts!: number;
  registeredExpenses!: number;
  grossProfit!: number;
  estimatedNetProfit!: number;
  profitMargin!: number;
  warnings!: string[];
}
