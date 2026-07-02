import { Injectable } from '@nestjs/common';
import { CashMovementType, Prisma, PurchaseOrderStatus, QuickServiceSaleStatus, SaleStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  sales(where: Prisma.SaleWhereInput) {
    return this.prisma.sale.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true } },
        customer: { select: { id: true, fullName: true } },
        items: { include: { product: true } },
        payments: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  products(where: Prisma.ProductWhereInput = {}) {
    return this.prisma.product.findMany({
      where,
      include: { category: true, movements: { orderBy: { createdAt: 'desc' }, take: 80 } },
      orderBy: { name: 'asc' },
    });
  }

  serviceOrders(where: Prisma.ServiceOrderWhereInput) {
    return this.prisma.serviceOrder.findMany({
      where,
      include: { user: { select: { id: true, fullName: true } }, customer: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  quickServiceSales(where: Prisma.QuickServiceSaleWhereInput) {
    return this.prisma.quickServiceSale.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true } },
        customer: { select: { id: true, fullName: true } },
        items: { include: { quickService: { include: { category: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  purchases(where: Prisma.PurchaseOrderWhereInput) {
    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        user: { select: { id: true, fullName: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  cashSessions(where: Prisma.CashSessionWhereInput) {
    return this.prisma.cashSession.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true } },
        movements: { include: { user: { select: { id: true, fullName: true } } }, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { openedAt: 'asc' },
    });
  }

  inventoryMovements(where: Prisma.InventoryMovementWhereInput) {
    return this.prisma.inventoryMovement.findMany({
      where,
      include: { product: { include: { category: true } }, user: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async summaryCounts(start: Date, end: Date) {
    const [productsLowStock, pendingServiceOrders, pendingPurchases] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true, stock: { lte: this.prisma.product.fields.minStock } } }),
      this.prisma.serviceOrder.count({ where: { status: { in: ['RECEIVED', 'DIAGNOSIS', 'IN_PROGRESS', 'READY'] } } }),
      this.prisma.purchaseOrder.count({ where: { status: { in: [PurchaseOrderStatus.PENDING, PurchaseOrderStatus.PARTIALLY_RECEIVED] } } }),
    ]);

    const cashMovements = await this.prisma.cashMovement.findMany({
      where: { createdAt: { gte: start, lte: end } },
    });

    return {
      productsLowStock,
      pendingServiceOrders,
      pendingPurchases,
      totalExpenses: cashMovements.filter((item) => item.type === CashMovementType.EXPENSE).reduce((sum, item) => sum + Number(item.amount), 0),
    };
  }

  saleStatuses() {
    return { completed: SaleStatus.COMPLETED, cancelled: SaleStatus.CANCELLED };
  }

  quickServiceStatuses() {
    return { completed: QuickServiceSaleStatus.COMPLETED, cancelled: QuickServiceSaleStatus.CANCELLED };
  }
}
