import { Injectable } from '@nestjs/common';
import { CashMovementType, QuickServiceSaleStatus, SaleStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProfitabilityRepository {
  constructor(private readonly prisma: PrismaService) {}

  sales(start: Date, end: Date, productId?: string, categoryId?: string) {
    return this.prisma.sale.findMany({
      where: { status: SaleStatus.COMPLETED, createdAt: { gte: start, lte: end }, items: { some: { productId, product: { categoryId } } } },
      include: { items: { include: { product: { include: { category: true } } } } },
    });
  }

  quickSales(start: Date, end: Date, categoryId?: string) {
    return this.prisma.quickServiceSale.findMany({
      where: { status: QuickServiceSaleStatus.COMPLETED, createdAt: { gte: start, lte: end }, items: { some: { quickService: { categoryId } } } },
      include: { items: { include: { quickService: { include: { category: true } } } } },
    });
  }

  expenses(start: Date, end: Date) {
    return this.prisma.cashMovement.findMany({ where: { type: CashMovementType.EXPENSE, createdAt: { gte: start, lte: end } } });
  }
}
