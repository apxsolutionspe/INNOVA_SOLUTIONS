import { Injectable } from '@nestjs/common';
import { CashMovementType, PaymentMethod, PurchaseOrderStatus, QuickServiceSaleStatus, SaleStatus, ServiceOrderStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) {}

  async summary() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [customersCount, inventory, salesToday, incomeTodayRows, incomeMonthRows, itemsToday, serviceOrdersPending, serviceOrdersReady, serviceOrdersDeliveredToday, serviceOrdersInProgress, openCash, cashMovementsToday, quickServicesToday, quickServiceSalesToday, quickServicesCount, purchasesToday, purchasesTodayRows, pendingPurchases, suppliersCount, productsToRestock, criticalNotifications] = await Promise.all([
      this.prisma.customer.count({ where: { isActive: true } }),
      this.inventoryService.getSummary(),
      this.prisma.sale.count({
        where: { status: SaleStatus.COMPLETED, createdAt: { gte: startOfToday } },
      }),
      this.prisma.sale.findMany({
        where: { status: SaleStatus.COMPLETED, createdAt: { gte: startOfToday } },
        select: { total: true },
      }),
      this.prisma.sale.findMany({
        where: { status: SaleStatus.COMPLETED, createdAt: { gte: startOfMonth } },
        select: { total: true },
      }),
      this.prisma.saleItem.findMany({
        where: {
          sale: { status: SaleStatus.COMPLETED, createdAt: { gte: startOfToday } },
        },
        select: { quantity: true },
      }),
      this.prisma.serviceOrder.count({ where: { status: { in: [ServiceOrderStatus.RECEIVED, ServiceOrderStatus.DIAGNOSIS] } } }),
      this.prisma.serviceOrder.count({ where: { status: ServiceOrderStatus.READY } }),
      this.prisma.serviceOrder.count({ where: { status: ServiceOrderStatus.DELIVERED, deliveredAt: { gte: startOfToday } } }),
      this.prisma.serviceOrder.count({ where: { status: ServiceOrderStatus.IN_PROGRESS } }),
      this.prisma.cashSession.findFirst({ where: { status: 'OPEN' }, orderBy: { openedAt: 'desc' } }),
      this.prisma.cashMovement.findMany({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.quickServiceSale.count({ where: { status: QuickServiceSaleStatus.COMPLETED, createdAt: { gte: startOfToday } } }),
      this.prisma.quickServiceSale.findMany({
        where: { status: QuickServiceSaleStatus.COMPLETED, createdAt: { gte: startOfToday } },
        include: { items: true },
      }),
      this.prisma.quickService.count({ where: { isActive: true } }),
      this.prisma.purchaseOrder.count({ where: { status: { not: PurchaseOrderStatus.CANCELLED }, createdAt: { gte: startOfToday } } }),
      this.prisma.purchaseOrder.findMany({ where: { status: { not: PurchaseOrderStatus.CANCELLED }, createdAt: { gte: startOfToday } }, select: { total: true } }),
      this.prisma.purchaseOrder.count({ where: { status: { in: [PurchaseOrderStatus.PENDING, PurchaseOrderStatus.PARTIALLY_RECEIVED] } } }),
      this.prisma.supplier.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: true, stock: { lte: this.prisma.product.fields.minStock } } }),
      this.prisma.notification.count({ where: { isRead: false, priority: { in: ['HIGH', 'CRITICAL'] } } }),
    ]);
    const incomeTypes: CashMovementType[] = [CashMovementType.INCOME, CashMovementType.SALE, CashMovementType.SERVICE_PAYMENT, CashMovementType.ADJUSTMENT];
    const sumMethod = (method: PaymentMethod) => cashMovementsToday.filter((m) => m.paymentMethod === method && incomeTypes.includes(m.type)).reduce((sum, item) => sum + Number(item.amount), 0);
    const expensesToday = cashMovementsToday.filter((m) => m.type === CashMovementType.EXPENSE).reduce((sum, item) => sum + Number(item.amount), 0);
    const quickServicesIncomeToday = quickServiceSalesToday.reduce((sum, sale) => sum + Number(sale.total), 0);
    const serviceCounts = new Map<string, number>();
    quickServiceSalesToday.flatMap((sale) => sale.items).forEach((item) => serviceCounts.set(item.description, (serviceCounts.get(item.description) ?? 0) + item.quantity));
    const topQuickServicesToday = [...serviceCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sin datos';
    const incomeToday = incomeTodayRows.reduce((sum, sale) => sum + Number(sale.total), 0);
    const expensesAmountToday = expensesToday;
    const netProfitEstimated = incomeToday + quickServicesIncomeToday - expensesAmountToday;

    return {
      customersCount,
      productsCount: inventory.productsCount,
      lowStockCount: inventory.lowStockCount,
      inventoryValue: inventory.inventoryValue,
      salesToday,
      incomeToday,
      incomeMonth: incomeMonthRows.reduce((sum, sale) => sum + Number(sale.total), 0),
      productsSoldToday: itemsToday.reduce((sum, item) => sum + item.quantity, 0),
      serviceOrdersPending,
      serviceOrdersReady,
      serviceOrdersDeliveredToday,
      serviceOrdersInProgress,
      currentCashStatus: openCash?.status ?? 'CLOSED',
      totalCashToday: sumMethod(PaymentMethod.CASH),
      totalYapeToday: sumMethod(PaymentMethod.YAPE),
      totalPlinToday: sumMethod(PaymentMethod.PLIN),
      totalTransferToday: sumMethod(PaymentMethod.TRANSFER),
      expensesToday,
      netCashToday: cashMovementsToday.filter((m) => incomeTypes.includes(m.type)).reduce((sum, item) => sum + Number(item.amount), 0) - expensesToday,
      quickServicesToday,
      quickServicesIncomeToday,
      topQuickServicesToday,
      quickServicesCount,
      purchasesToday,
      purchasesAmountToday: purchasesTodayRows.reduce((sum, purchase) => sum + Number(purchase.total), 0),
      pendingPurchases,
      suppliersCount,
      productsToRestock,
      netProfitEstimated,
      profitMarginEstimated: incomeToday + quickServicesIncomeToday ? (netProfitEstimated / (incomeToday + quickServicesIncomeToday)) * 100 : 0,
      criticalNotifications,
      cashDifference: openCash ? Number(openCash.difference) : 0,
    };
  }
}
