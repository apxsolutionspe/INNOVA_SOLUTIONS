import { ForbiddenException, Injectable } from '@nestjs/common';
import { CashMovementType, PaymentMethod, Prisma, PurchaseOrderStatus, QuickServiceSaleStatus, SaleStatus, ServiceOrderStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CashReportQueryDto } from './dto/cash-report-query.dto';
import { ExportReportQueryDto } from './dto/export-report-query.dto';
import { InventoryReportQueryDto } from './dto/inventory-report-query.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { ExcelReportExporter } from './exporters/excel-report.exporter';
import { ExportTable, PdfReportExporter } from './exporters/pdf-report.exporter';
import { ReportsRepository } from './reports.repository';
import { formatDateRange, resolveReportDateRange } from './utils/report-date-range.util';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ReportsRepository,
  ) {}

  async summary(query: ReportQueryDto, user: AuthenticatedUser) {
    const { start, end } = this.resolveRange(query, user);
    const [sales, quickSales, serviceOrders, purchases, counts] = await Promise.all([
      this.repository.sales(this.salesWhere(query, start, end)),
      this.repository.quickServiceSales(this.quickServicesWhere(query, start, end)),
      this.repository.serviceOrders(this.serviceOrdersWhere(query, start, end)),
      this.repository.purchases(this.purchasesWhere(query, start, end)),
      this.repository.summaryCounts(start, end),
    ]);
    const completedSales = sales.filter((sale) => sale.status === SaleStatus.COMPLETED);
    const completedQuick = quickSales.filter((sale) => sale.status === QuickServiceSaleStatus.COMPLETED);
    const activePurchases = purchases.filter((purchase) => purchase.status !== PurchaseOrderStatus.CANCELLED);
    const paidOrderStatuses: ServiceOrderStatus[] = [ServiceOrderStatus.DELIVERED, ServiceOrderStatus.READY];
    const paidOrders = serviceOrders.filter((order) => paidOrderStatuses.includes(order.status));
    const totalSalesAmount = this.sum(completedSales, 'total');
    const totalQuickServicesAmount = this.sum(completedQuick, 'total');
    const totalServiceOrdersAmount = this.sum(paidOrders, 'total');
    const totalPurchasesAmount = this.sum(activePurchases, 'total');
    const topProducts = this.topSaleItems(completedSales);
    const topQuickServices = this.topQuickServiceItems(completedQuick);
    const paymentMethodSummary = this.paymentSummary([...sales.flatMap((sale) => sale.payments), ...completedQuick.map((sale) => ({ method: sale.paymentMethod, amount: sale.total }))]);

    return {
      range: { start, end },
      totalSales: completedSales.length,
      totalSalesAmount,
      totalQuickServicesAmount,
      totalServiceOrdersAmount,
      totalPurchasesAmount,
      totalExpenses: counts.totalExpenses,
      netIncome: totalSalesAmount + totalQuickServicesAmount + totalServiceOrdersAmount - totalPurchasesAmount - counts.totalExpenses,
      productsLowStock: counts.productsLowStock,
      pendingServiceOrders: counts.pendingServiceOrders,
      pendingPurchases: counts.pendingPurchases,
      topProducts,
      topQuickServices,
      paymentMethodSummary,
    };
  }

  async sales(query: SalesReportQueryDto, user: AuthenticatedUser) {
    const { start, end } = this.resolveRange(query, user);
    const sales = await this.repository.sales(this.salesWhere(query, start, end));
    const completed = sales.filter((sale) => sale.status === SaleStatus.COMPLETED);
    const totalSold = this.sum(completed, 'total');
    return {
      salesByDate: this.sumByDate(completed, 'total'),
      salesCount: completed.length,
      totalSold,
      cancelledSales: sales.filter((sale) => sale.status === SaleStatus.CANCELLED).length,
      topProducts: this.topSaleItems(completed),
      salesByPaymentMethod: this.paymentSummary(sales.flatMap((sale) => sale.payments)),
      salesByUser: this.countAmountBy(completed, (sale) => sale.user.fullName, 'total'),
      averageTicket: completed.length ? totalSold / completed.length : 0,
      rows: sales.map((sale) => ({
        code: sale.code,
        date: sale.createdAt,
        customer: sale.customer?.fullName ?? 'Cliente general',
        user: sale.user.fullName,
        paymentMethod: sale.payments.map((payment) => payment.method).join(', ') || 'Sin pago',
        subtotal: Number(sale.subtotal),
        discount: Number(sale.discountTotal),
        tax: Number(sale.taxTotal),
        total: Number(sale.total),
        status: sale.status,
      })),
    };
  }

  async inventory(query: InventoryReportQueryDto, user: AuthenticatedUser) {
    this.ensureOperationalReport(user);
    const products = await this.repository.products({
      categoryId: query.categoryId,
      id: query.productId,
      isActive: true,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { sku: { contains: query.search, mode: 'insensitive' } },
            { category: { name: { contains: query.search, mode: 'insensitive' } } },
          ]
        : undefined,
    });
    const movements = await this.repository.inventoryMovements({
      productId: query.productId,
      product: { categoryId: query.categoryId },
    });
    return {
      totalProducts: products.length,
      activeProducts: products.filter((product) => product.isActive).length,
      lowStockProducts: products.filter((product) => product.stock <= product.minStock).length,
      outOfStockProducts: products.filter((product) => product.stock <= 0).length,
      inventoryValue: products.reduce((sum, product) => sum + Number(product.purchasePrice) * product.stock, 0),
      movements: movements.map((movement) => ({ id: movement.id, product: movement.product.name, type: movement.type, quantity: movement.quantity, reason: movement.reason, createdAt: movement.createdAt })),
      topRotationProducts: this.topInventoryMovements(movements),
      rows: products.map((product) => ({
        name: product.name,
        sku: product.sku,
        category: product.category.name,
        stock: product.stock,
        minStock: product.minStock,
        purchasePrice: Number(product.purchasePrice),
        salePrice: Number(product.salePrice),
        status: product.stock <= 0 ? 'Sin stock' : product.stock <= product.minStock ? 'Stock bajo' : 'Disponible',
      })),
    };
  }

  async serviceOrders(query: ReportQueryDto, user: AuthenticatedUser) {
    const { start, end } = this.resolveRange(query, user);
    const orders = await this.repository.serviceOrders(this.serviceOrdersWhere(query, start, end));
    const delivered = orders.filter((order) => order.status === ServiceOrderStatus.DELIVERED);
    const attentionTimes = delivered.filter((order) => order.deliveredAt).map((order) => Number(order.deliveredAt) - Number(order.receivedAt));
    const pendingStatuses: ServiceOrderStatus[] = [ServiceOrderStatus.RECEIVED, ServiceOrderStatus.DIAGNOSIS, ServiceOrderStatus.IN_PROGRESS, ServiceOrderStatus.READY];
    return {
      ordersByStatus: this.countBy(orders, (order) => order.status),
      totalOrders: orders.length,
      receivedOrders: orders.filter((order) => order.status === ServiceOrderStatus.RECEIVED).length,
      diagnosisOrders: orders.filter((order) => order.status === ServiceOrderStatus.DIAGNOSIS).length,
      inProgressOrders: orders.filter((order) => order.status === ServiceOrderStatus.IN_PROGRESS).length,
      readyOrders: orders.filter((order) => order.status === ServiceOrderStatus.READY).length,
      deliveredOrders: delivered.length,
      cancelledOrders: orders.filter((order) => order.status === ServiceOrderStatus.CANCELLED).length,
      serviceOrderIncome: this.sum(delivered, 'total'),
      laborTotal: orders.filter((order) => order.status !== ServiceOrderStatus.CANCELLED).reduce((sum, order) => sum + Number(order.laborCost), 0),
      partsTotal: orders.filter((order) => order.status !== ServiceOrderStatus.CANCELLED).reduce((sum, order) => sum + Number(order.partsCost), 0),
      discountTotal: orders.filter((order) => order.status !== ServiceOrderStatus.CANCELLED).reduce((sum, order) => sum + Number(order.discount), 0),
      pendingOrders: orders.filter((order) => pendingStatuses.includes(order.status)).length,
      attendedCustomers: new Set(orders.map((order) => order.customerId)).size,
      averageAttentionHours: attentionTimes.length ? attentionTimes.reduce((a, b) => a + b, 0) / attentionTimes.length / 36e5 : 0,
      responsibleUsers: this.countBy(orders, (order) => order.user.fullName),
      rows: orders.map((order) => ({
        code: order.code,
        receivedAt: order.receivedAt,
        customer: order.customer.fullName,
        equipment: [order.equipmentType, order.brand, order.model].filter(Boolean).join(' '),
        reportedIssue: order.reportedIssue,
        diagnosis: order.technicalDiagnosis ?? order.initialDiagnosis ?? 'Sin diagnóstico',
        status: order.status,
        laborCost: Number(order.laborCost),
        partsCost: Number(order.partsCost),
        discount: Number(order.discount),
        total: Number(order.total),
      })),
    };
  }

  async quickServices(query: ReportQueryDto, user: AuthenticatedUser) {
    const { start, end } = this.resolveRange(query, user);
    const sales = await this.repository.quickServiceSales(this.quickServicesWhere(query, start, end));
    const completed = sales.filter((sale) => sale.status === QuickServiceSaleStatus.COMPLETED);
    return {
      totalQuickServices: completed.length,
      quickServicesIncome: this.sum(completed, 'total'),
      topQuickServices: this.topQuickServiceItems(completed),
      incomeByCategory: this.incomeByQuickCategory(completed),
      paymentMethods: this.paymentSummary(completed.map((sale) => ({ method: sale.paymentMethod, amount: sale.total }))),
      cancelledOperations: sales.filter((sale) => sale.status === QuickServiceSaleStatus.CANCELLED).length,
      averageTicket: completed.length ? this.sum(completed, 'total') / completed.length : 0,
      attendedCustomers: new Set(sales.filter((sale) => sale.customerId).map((sale) => sale.customerId)).size,
      rows: sales.flatMap((sale) =>
        sale.items.map((item) => ({
          date: sale.createdAt,
          code: sale.code,
          service: item.description,
          customer: sale.customer?.fullName ?? 'Cliente general',
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.subtotal),
          status: sale.status,
        })),
      ),
    };
  }

  async purchases(query: ReportQueryDto, user: AuthenticatedUser) {
    const { start, end } = this.resolveRange(query, user);
    const purchases = await this.repository.purchases(this.purchasesWhere(query, start, end));
    const active = purchases.filter((purchase) => purchase.status !== PurchaseOrderStatus.CANCELLED);
    return {
      purchasesByPeriod: this.sumByDate(active, 'total'),
      totalPurchases: purchases.length,
      totalPurchasedAmount: this.sum(active, 'total'),
      pendingPurchases: purchases.filter((purchase) => purchase.status === PurchaseOrderStatus.PENDING || purchase.status === PurchaseOrderStatus.PARTIALLY_RECEIVED).length,
      receivedPurchases: purchases.filter((purchase) => purchase.status === PurchaseOrderStatus.RECEIVED).length,
      paidPurchases: purchases.filter((purchase) => purchase.paymentStatus === 'PAID').length,
      suppliersCount: new Set(purchases.map((purchase) => purchase.supplierId)).size,
      productsPurchased: active.flatMap((purchase) => purchase.items).reduce((sum, item) => sum + item.quantity, 0),
      topSuppliers: this.countAmountBy(active, (purchase) => purchase.supplier.name, 'total'),
      topPurchasedProducts: this.topPurchasedProducts(active),
      purchasesByPaymentStatus: this.countBy(purchases, (purchase) => purchase.paymentStatus),
      rows: purchases.map((purchase) => ({
        date: purchase.createdAt,
        supplier: purchase.supplier.name,
        code: purchase.code,
        products: purchase.items.map((item) => item.product.name).join(', '),
        status: purchase.status,
        paymentStatus: purchase.paymentStatus,
        total: Number(purchase.total),
      })),
    };
  }

  async cash(query: CashReportQueryDto, user: AuthenticatedUser) {
    const { start, end } = this.resolveRange(query, user);
    const sessions = await this.repository.cashSessions({ openedAt: { gte: start, lte: end }, userId: query.userId });
    const movements = sessions.flatMap((session) => session.movements);
    const incomeTypes: CashMovementType[] = [CashMovementType.INCOME, CashMovementType.SALE, CashMovementType.SERVICE_PAYMENT, CashMovementType.ADJUSTMENT];
    const totalIncome = movements.filter((movement) => incomeTypes.includes(movement.type)).reduce((sum, movement) => sum + Number(movement.amount), 0);
    const totalExpenses = movements.filter((movement) => movement.type === CashMovementType.EXPENSE).reduce((sum, movement) => sum + Number(movement.amount), 0);
    return {
      openSessions: sessions.filter((session) => session.status === 'OPEN').length,
      closedSessions: sessions.filter((session) => session.status === 'CLOSED').length,
      totalCash: this.sumMovementsByMethod(movements, PaymentMethod.CASH),
      totalYape: this.sumMovementsByMethod(movements, PaymentMethod.YAPE),
      totalPlin: this.sumMovementsByMethod(movements, PaymentMethod.PLIN),
      totalTransfer: this.sumMovementsByMethod(movements, PaymentMethod.TRANSFER),
      income: totalIncome,
      expenses: totalExpenses,
      cashDifference: sessions.reduce((sum, session) => sum + Number(session.difference), 0),
      movementsByUser: this.countAmountBy(movements, (movement) => movement.user.fullName, 'amount'),
      dailyClosing: sessions.map((session) => ({ code: session.code, user: session.user.fullName, status: session.status, openedAt: session.openedAt, closedAt: session.closedAt, difference: Number(session.difference) })),
      rows: movements.map((movement) => ({ date: movement.createdAt, type: movement.type, concept: movement.concept, method: movement.paymentMethod, amount: Number(movement.amount), user: movement.user.fullName })),
    };
  }

  async profitabilityBasic(query: ReportQueryDto, user: AuthenticatedUser) {
    const { start, end } = this.resolveRange(query, user);
    const [sales, quickSales, cash] = await Promise.all([this.repository.sales(this.salesWhere(query, start, end)), this.repository.quickServiceSales(this.quickServicesWhere(query, start, end)), this.cash(query, user)]);
    const productIncome = sales.filter((sale) => sale.status === SaleStatus.COMPLETED).reduce((sum, sale) => sum + Number(sale.total), 0);
    const productCost = sales.flatMap((sale) => sale.items).reduce((sum, item) => sum + Number(item.product?.purchasePrice ?? 0) * item.quantity, 0);
    const quickIncome = quickSales.filter((sale) => sale.status === QuickServiceSaleStatus.COMPLETED).reduce((sum, sale) => sum + Number(sale.total), 0);
    const quickCost = quickSales.flatMap((sale) => sale.items).reduce((sum, item) => sum + Number(item.quickService?.costPrice ?? 0) * item.quantity, 0);
    const income = productIncome + quickIncome;
    const costs = productCost + quickCost;
    const grossProfit = income - costs - cash.expenses;
    return {
      totalIncome: income,
      estimatedCosts: costs,
      registeredExpenses: cash.expenses,
      estimatedGrossProfit: grossProfit,
      estimatedMargin: income ? (grossProfit / income) * 100 : 0,
      mostProfitableProducts: this.profitableProducts(sales),
      mostProfitableQuickServices: this.profitableQuickServices(quickSales),
      rows: [
        { concept: 'Ingresos por ventas', income: productIncome, costs: productCost, expenses: 0, profit: productIncome - productCost },
        { concept: 'Ingresos por servicios rápidos', income: quickIncome, costs: quickCost, expenses: 0, profit: quickIncome - quickCost },
        { concept: 'Gastos registrados en caja', income: 0, costs: 0, expenses: cash.expenses, profit: -cash.expenses },
      ],
    };
  }

  async exportSales(query: ExportReportQueryDto, user: AuthenticatedUser, type: 'pdf' | 'excel') {
    const { start, end } = this.resolveRange(query, user);
    const report = await this.sales(query, user);
    const table: ExportTable = {
      title: 'Reporte de ventas',
      dateRange: formatDateRange(start, end),
      columns: ['Fecha', 'Comprobante', 'Cliente', 'Método de pago', 'Subtotal', 'Descuento', 'IGV', 'Total', 'Estado'],
      rows: report.rows.map((row: any) => [
        new Date(row.date).toLocaleDateString('es-PE'),
        row.code,
        row.customer,
        row.paymentMethod,
        row.subtotal.toFixed(2),
        row.discount.toFixed(2),
        row.tax.toFixed(2),
        row.total.toFixed(2),
        row.status,
      ]),
      totals: [['Total vendido', report.totalSold.toFixed(2)], ['Ventas', report.salesCount]],
    };
    await this.auditExport(user.id, 'EXPORT_SALES_REPORT', type);
    return this.export(table, type);
  }

  async exportInventory(query: ExportReportQueryDto, user: AuthenticatedUser, type: 'pdf' | 'excel') {
    const report = await this.inventory(query, user);
    const table: ExportTable = {
      title: 'Reporte de inventario',
      dateRange: 'Inventario actual',
      columns: ['Producto', 'SKU', 'Categoría', 'Stock', 'Mínimo', 'Costo', 'Venta', 'Estado'],
      rows: report.rows.map((row: any) => [row.name, row.sku, row.category, row.stock, row.minStock, row.purchasePrice.toFixed(2), row.salePrice.toFixed(2), row.status]),
      totals: [['Valor inventario', report.inventoryValue.toFixed(2)], ['Stock bajo', report.lowStockProducts]],
    };
    await this.auditExport(user.id, 'EXPORT_INVENTORY_REPORT', type);
    return this.export(table, type);
  }

  async exportCash(query: ExportReportQueryDto, user: AuthenticatedUser, type: 'pdf' | 'excel') {
    const { start, end } = this.resolveRange(query, user);
    const report = await this.cash(query, user);
    const table: ExportTable = {
      title: 'Reporte de caja',
      dateRange: formatDateRange(start, end),
      columns: ['Fecha', 'Tipo', 'Concepto', 'Método', 'Usuario', 'Monto'],
      rows: report.rows.map((row: any) => [new Date(row.date).toLocaleDateString('es-PE'), row.type, row.concept, row.method, row.user, row.amount.toFixed(2)]),
      totals: [['Ingresos', report.income.toFixed(2)], ['Gastos', report.expenses.toFixed(2)], ['Diferencia', report.cashDifference.toFixed(2)]],
    };
    await this.auditExport(user.id, 'EXPORT_CASH_REPORT', type);
    return this.export(table, type);
  }

  async exportServiceOrders(query: ExportReportQueryDto, user: AuthenticatedUser, type: 'pdf' | 'excel') {
    const { start, end } = this.resolveRange(query, user);
    const report = await this.serviceOrders(query, user);
    const table: ExportTable = {
      title: 'Reporte de servicios técnicos',
      dateRange: formatDateRange(start, end),
      columns: ['Código OT', 'Fecha', 'Cliente', 'Equipo', 'Estado', 'Mano de obra', 'Repuestos', 'Descuento', 'Total'],
      rows: report.rows.map((row: any) => [
        row.code,
        new Date(row.receivedAt).toLocaleDateString('es-PE'),
        row.customer,
        row.equipment,
        row.status,
        row.laborCost.toFixed(2),
        row.partsCost.toFixed(2),
        row.discount.toFixed(2),
        row.total.toFixed(2),
      ]),
      totals: [
        ['Órdenes', report.totalOrders],
        ['Ingresos', report.serviceOrderIncome.toFixed(2)],
        ['Mano de obra', report.laborTotal.toFixed(2)],
        ['Repuestos', report.partsTotal.toFixed(2)],
      ],
    };
    await this.auditExport(user.id, 'EXPORT_SERVICE_ORDERS_REPORT', type);
    return this.export(table, type);
  }

  async exportQuickServices(query: ExportReportQueryDto, user: AuthenticatedUser, type: 'pdf' | 'excel') {
    const { start, end } = this.resolveRange(query, user);
    const report = await this.quickServices(query, user);
    const table: ExportTable = {
      title: 'Reporte de servicios rápidos',
      dateRange: formatDateRange(start, end),
      columns: ['Fecha', 'Código', 'Servicio', 'Cliente', 'Cantidad', 'Precio unitario', 'Total', 'Estado'],
      rows: report.rows.map((row: any) => [
        new Date(row.date).toLocaleDateString('es-PE'),
        row.code,
        row.service,
        row.customer,
        row.quantity,
        row.unitPrice.toFixed(2),
        row.total.toFixed(2),
        row.status,
      ]),
      totals: [
        ['Operaciones', report.totalQuickServices],
        ['Ingresos', report.quickServicesIncome.toFixed(2)],
        ['Ticket promedio', report.averageTicket.toFixed(2)],
      ],
    };
    await this.auditExport(user.id, 'EXPORT_QUICK_SERVICES_REPORT', type);
    return this.export(table, type);
  }

  async exportPurchases(query: ExportReportQueryDto, user: AuthenticatedUser, type: 'pdf' | 'excel') {
    const { start, end } = this.resolveRange(query, user);
    const report = await this.purchases(query, user);
    const table: ExportTable = {
      title: 'Reporte de compras',
      dateRange: formatDateRange(start, end),
      columns: ['Fecha', 'Proveedor', 'Código', 'Productos', 'Estado', 'Estado de pago', 'Total'],
      rows: report.rows.map((row: any) => [
        new Date(row.date).toLocaleDateString('es-PE'),
        row.supplier,
        row.code,
        row.products,
        row.status,
        row.paymentStatus,
        row.total.toFixed(2),
      ]),
      totals: [
        ['Compras', report.totalPurchases],
        ['Monto comprado', report.totalPurchasedAmount.toFixed(2)],
        ['Pendientes', report.pendingPurchases],
      ],
    };
    await this.auditExport(user.id, 'EXPORT_PURCHASES_REPORT', type);
    return this.export(table, type);
  }

  async exportProfitability(query: ExportReportQueryDto, user: AuthenticatedUser, type: 'pdf' | 'excel') {
    const { start, end } = this.resolveRange(query, user);
    const report = await this.profitabilityBasic(query, user);
    const table: ExportTable = {
      title: 'Reporte de rentabilidad',
      dateRange: formatDateRange(start, end),
      columns: ['Concepto', 'Ingresos', 'Costos', 'Gastos', 'Utilidad'],
      rows: report.rows.map((row: any) => [
        row.concept,
        row.income.toFixed(2),
        row.costs.toFixed(2),
        row.expenses.toFixed(2),
        row.profit.toFixed(2),
      ]),
      totals: [
        ['Ingresos', report.totalIncome.toFixed(2)],
        ['Costos', report.estimatedCosts.toFixed(2)],
        ['Gastos', report.registeredExpenses.toFixed(2)],
        ['Utilidad neta estimada', report.estimatedGrossProfit.toFixed(2)],
        ['Margen', `${report.estimatedMargin.toFixed(2)}%`],
      ],
    };
    await this.auditExport(user.id, 'EXPORT_PROFITABILITY_REPORT', type);
    return this.export(table, type);
  }

  private export(table: ExportTable, type: 'pdf' | 'excel') {
    return type === 'pdf' ? new PdfReportExporter().export(table) : new ExcelReportExporter().export(table);
  }

  private resolveRange(query: ReportQueryDto, user: AuthenticatedUser) {
    if (user.role.name !== 'ADMIN') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    return resolveReportDateRange(query.startDate, query.endDate);
  }

  private ensureOperationalReport(user: AuthenticatedUser) {
    if (!user) throw new ForbiddenException('Usuario no autenticado');
  }

  private salesWhere(query: ReportQueryDto, start: Date, end: Date): Prisma.SaleWhereInput {
    return {
      createdAt: { gte: start, lte: end },
      userId: query.userId,
      customerId: query.customerId,
      status: query.status as SaleStatus | undefined,
      payments: query.paymentMethod ? { some: { method: query.paymentMethod } } : undefined,
      OR: query.search
        ? [
            { code: { contains: query.search, mode: 'insensitive' } },
            { customer: { fullName: { contains: query.search, mode: 'insensitive' } } },
            { items: { some: { description: { contains: query.search, mode: 'insensitive' } } } },
          ]
        : undefined,
    };
  }

  private quickServicesWhere(query: ReportQueryDto, start: Date, end: Date): Prisma.QuickServiceSaleWhereInput {
    return {
      createdAt: { gte: start, lte: end },
      userId: query.userId,
      customerId: query.customerId,
      status: query.status as QuickServiceSaleStatus | undefined,
      paymentMethod: query.paymentMethod,
      OR: query.search
        ? [
            { code: { contains: query.search, mode: 'insensitive' } },
            { customer: { fullName: { contains: query.search, mode: 'insensitive' } } },
            { items: { some: { description: { contains: query.search, mode: 'insensitive' } } } },
          ]
        : undefined,
    };
  }

  private serviceOrdersWhere(query: ReportQueryDto, start: Date, end: Date): Prisma.ServiceOrderWhereInput {
    return {
      createdAt: { gte: start, lte: end },
      userId: query.userId,
      customerId: query.customerId,
      status: query.status as ServiceOrderStatus | undefined,
      OR: query.search
        ? [
            { code: { contains: query.search, mode: 'insensitive' } },
            { customer: { fullName: { contains: query.search, mode: 'insensitive' } } },
            { equipmentType: { contains: query.search, mode: 'insensitive' } },
            { brand: { contains: query.search, mode: 'insensitive' } },
            { serialNumber: { contains: query.search, mode: 'insensitive' } },
            { reportedIssue: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
  }

  private purchasesWhere(query: ReportQueryDto, start: Date, end: Date): Prisma.PurchaseOrderWhereInput {
    return {
      createdAt: { gte: start, lte: end },
      userId: query.userId,
      supplierId: query.supplierId,
      status: query.status as PurchaseOrderStatus | undefined,
      paymentMethod: query.paymentMethod,
      OR: query.search
        ? [
            { code: { contains: query.search, mode: 'insensitive' } },
            { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
            { supplier: { ruc: { contains: query.search, mode: 'insensitive' } } },
            { items: { some: { product: { name: { contains: query.search, mode: 'insensitive' } } } } },
          ]
        : undefined,
    };
  }

  private sum(items: any[], field: string) {
    return items.reduce((sum, item) => sum + Number(item[field] ?? 0), 0);
  }

  private sumByDate(items: any[], field: string) {
    const rows = new Map<string, number>();
    items.forEach((item) => {
      const key = new Date(item.createdAt).toISOString().slice(0, 10);
      rows.set(key, (rows.get(key) ?? 0) + Number(item[field] ?? 0));
    });
    return [...rows.entries()].map(([date, total]) => ({ date, total }));
  }

  private countBy(items: any[], selector: (item: any) => string) {
    const rows = new Map<string, number>();
    items.forEach((item) => rows.set(selector(item), (rows.get(selector(item)) ?? 0) + 1));
    return [...rows.entries()].map(([name, value]) => ({ name, value }));
  }

  private countAmountBy(items: any[], selector: (item: any) => string, amountField: string) {
    const rows = new Map<string, { count: number; amount: number }>();
    items.forEach((item) => {
      const name = selector(item);
      const current = rows.get(name) ?? { count: 0, amount: 0 };
      rows.set(name, { count: current.count + 1, amount: current.amount + Number(item[amountField] ?? 0) });
    });
    return [...rows.entries()].map(([name, value]) => ({ name, ...value }));
  }

  private paymentSummary(items: any[]) {
    const rows = new Map<string, number>();
    items.forEach((item) => rows.set(item.method, (rows.get(item.method) ?? 0) + Number(item.amount ?? 0)));
    return [...rows.entries()].map(([method, total]) => ({ method, total }));
  }

  private topSaleItems(sales: any[]) {
    const rows = new Map<string, { quantity: number; amount: number }>();
    sales.flatMap((sale) => sale.items).forEach((item) => {
      const name = item.description;
      const current = rows.get(name) ?? { quantity: 0, amount: 0 };
      rows.set(name, { quantity: current.quantity + item.quantity, amount: current.amount + Number(item.total) });
    });
    return [...rows.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  }

  private topQuickServiceItems(sales: any[]) {
    const rows = new Map<string, { quantity: number; amount: number }>();
    sales.flatMap((sale) => sale.items).forEach((item) => {
      const current = rows.get(item.description) ?? { quantity: 0, amount: 0 };
      rows.set(item.description, { quantity: current.quantity + item.quantity, amount: current.amount + Number(item.subtotal) });
    });
    return [...rows.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  }

  private incomeByQuickCategory(sales: any[]) {
    const rows = new Map<string, number>();
    sales.flatMap((sale) => sale.items).forEach((item) => {
      const category = item.quickService?.category?.name ?? 'Sin categoria';
      rows.set(category, (rows.get(category) ?? 0) + Number(item.subtotal));
    });
    return [...rows.entries()].map(([name, total]) => ({ name, total }));
  }

  private topPurchasedProducts(purchases: any[]) {
    const rows = new Map<string, { quantity: number; amount: number }>();
    purchases.flatMap((purchase) => purchase.items).forEach((item) => {
      const name = item.product.name;
      const current = rows.get(name) ?? { quantity: 0, amount: 0 };
      rows.set(name, { quantity: current.quantity + item.quantity, amount: current.amount + Number(item.subtotal) });
    });
    return [...rows.entries()].map(([name, value]) => ({ name, ...value })).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  }

  private topInventoryMovements(movements: any[]) {
    const rows = new Map<string, number>();
    movements.forEach((movement) => rows.set(movement.product.name, (rows.get(movement.product.name) ?? 0) + movement.quantity));
    return [...rows.entries()].map(([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  }

  private sumMovementsByMethod(movements: any[], method: PaymentMethod) {
    return movements.filter((movement) => movement.paymentMethod === method).reduce((sum, movement) => sum + Number(movement.amount), 0);
  }

  private profitableProducts(sales: any[]) {
    return this.topSaleItems(sales).map((item) => ({ ...item, estimatedProfit: item.amount }));
  }

  private profitableQuickServices(sales: any[]) {
    return this.topQuickServiceItems(sales).map((item) => ({ ...item, estimatedProfit: item.amount }));
  }

  private auditExport(userId: string, action: string, type: string) {
    return this.prisma.auditLog.create({ data: { userId, action, module: 'reports', description: `Exportación ${type}` } });
  }
}
