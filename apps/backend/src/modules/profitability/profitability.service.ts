import { Injectable } from '@nestjs/common';

import { ProfitabilityQueryDto } from './dto/profitability-query.dto';
import { ProfitabilityRepository } from './profitability.repository';
import { calculateMargin, monthKey, roundMoney } from './utils/profitability-calculations.util';

@Injectable()
export class ProfitabilityService {
  constructor(private readonly repository: ProfitabilityRepository) {}

  async summary(query: ProfitabilityQueryDto) {
    const { start, end } = this.range(query);
    const [sales, quickSales, expenses] = await Promise.all([this.repository.sales(start, end, query.productId, query.categoryId), this.repository.quickSales(start, end, query.categoryId), this.repository.expenses(start, end)]);
    const productIncome = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const quickIncome = quickSales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const productCosts = sales.flatMap((sale) => sale.items).reduce((sum, item) => sum + Number(item.product?.purchasePrice ?? 0) * item.quantity, 0);
    const quickServiceCosts = quickSales.flatMap((sale) => sale.items).reduce((sum, item) => sum + Number(item.quickService?.costPrice ?? 0) * item.quantity, 0);
    const registeredExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalIncome = productIncome + quickIncome;
    const grossProfit = totalIncome - productCosts - quickServiceCosts;
    const estimatedNetProfit = grossProfit - registeredExpenses;
    const missingProductCosts = sales.flatMap((sale) => sale.items).filter((item) => !item.product || Number(item.product.purchasePrice) === 0).length;
    const missingServiceCosts = quickSales.flatMap((sale) => sale.items).filter((item) => !item.quickService?.costPrice).length;
    return {
      totalIncome: roundMoney(totalIncome),
      productCosts: roundMoney(productCosts),
      quickServiceCosts: roundMoney(quickServiceCosts),
      registeredExpenses: roundMoney(registeredExpenses),
      grossProfit: roundMoney(grossProfit),
      estimatedNetProfit: roundMoney(estimatedNetProfit),
      profitMargin: roundMoney(calculateMargin(estimatedNetProfit, totalIncome)),
      warnings: [missingProductCosts ? `${missingProductCosts} productos sin costo de compra` : '', missingServiceCosts ? `${missingServiceCosts} servicios sin costo estimado` : ''].filter(Boolean),
    };
  }

  async products(query: ProfitabilityQueryDto) {
    const { start, end } = this.range(query);
    const sales = await this.repository.sales(start, end, query.productId, query.categoryId);
    return this.groupItems(sales.flatMap((sale) => sale.items).map((item) => ({ name: item.description, income: Number(item.total), cost: Number(item.product?.purchasePrice ?? 0) * item.quantity, quantity: item.quantity })));
  }

  async services(query: ProfitabilityQueryDto) {
    const { start, end } = this.range(query);
    const sales = await this.repository.quickSales(start, end, query.categoryId);
    return this.groupItems(sales.flatMap((sale) => sale.items).map((item) => ({ name: item.description, income: Number(item.subtotal), cost: Number(item.quickService?.costPrice ?? 0) * item.quantity, quantity: item.quantity })));
  }

  async categories(query: ProfitabilityQueryDto) {
    const { start, end } = this.range(query);
    const [sales, quickSales] = await Promise.all([this.repository.sales(start, end, query.productId, query.categoryId), this.repository.quickSales(start, end, query.categoryId)]);
    return this.groupItems([
      ...sales.flatMap((sale) => sale.items).map((item) => ({ name: item.product?.category.name ?? 'Productos', income: Number(item.total), cost: Number(item.product?.purchasePrice ?? 0) * item.quantity, quantity: item.quantity })),
      ...quickSales.flatMap((sale) => sale.items).map((item) => ({ name: item.quickService?.category.name ?? 'Servicios', income: Number(item.subtotal), cost: Number(item.quickService?.costPrice ?? 0) * item.quantity, quantity: item.quantity })),
    ]);
  }

  async monthly(query: ProfitabilityQueryDto) {
    const { start, end } = this.range(query);
    const [sales, quickSales, expenses] = await Promise.all([this.repository.sales(start, end, query.productId, query.categoryId), this.repository.quickSales(start, end, query.categoryId), this.repository.expenses(start, end)]);
    const rows = new Map<string, { month: string; income: number; costs: number; expenses: number; profit: number }>();
    const ensure = (date: Date) => rows.get(monthKey(date)) ?? { month: monthKey(date), income: 0, costs: 0, expenses: 0, profit: 0 };
    sales.forEach((sale) => { const row = ensure(sale.createdAt); row.income += Number(sale.total); row.costs += sale.items.reduce((s, item) => s + Number(item.product?.purchasePrice ?? 0) * item.quantity, 0); rows.set(row.month, row); });
    quickSales.forEach((sale) => { const row = ensure(sale.createdAt); row.income += Number(sale.total); row.costs += sale.items.reduce((s, item) => s + Number(item.quickService?.costPrice ?? 0) * item.quantity, 0); rows.set(row.month, row); });
    expenses.forEach((expense) => { const row = ensure(expense.createdAt); row.expenses += Number(expense.amount); rows.set(row.month, row); });
    return [...rows.values()]
      .map((row) => ({
        ...row,
        income: roundMoney(row.income),
        costs: roundMoney(row.costs),
        expenses: roundMoney(row.expenses),
        profit: roundMoney(row.income - row.costs - row.expenses),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private groupItems(items: Array<{ name: string; income: number; cost: number; quantity: number }>) {
    const rows = new Map<string, { name: string; income: number; cost: number; quantity: number; profit: number; margin: number }>();
    items.forEach((item) => {
      const row = rows.get(item.name) ?? { name: item.name, income: 0, cost: 0, quantity: 0, profit: 0, margin: 0 };
      row.income += item.income; row.cost += item.cost; row.quantity += item.quantity; row.profit = roundMoney(row.income - row.cost); row.margin = roundMoney(calculateMargin(row.profit, row.income));
      rows.set(item.name, row);
    });
    return [...rows.values()]
      .map((row) => ({ ...row, income: roundMoney(row.income), cost: roundMoney(row.cost), profit: roundMoney(row.profit), margin: roundMoney(row.margin) }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 20);
  }

  private range(query: ProfitabilityQueryDto) {
    const now = new Date();
    const start = query.startDate ? new Date(query.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = query.endDate ? new Date(query.endDate) : now;
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
}
