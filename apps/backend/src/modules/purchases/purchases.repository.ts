import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { PurchaseQueryDto } from './dto/purchase-query.dto';

@Injectable()
export class PurchasesRepository {
  constructor(private readonly prisma: PrismaService) {}

  include(): Prisma.PurchaseOrderInclude {
    return {
      supplier: true,
      user: { select: { id: true, fullName: true, email: true, role: true } },
      items: { include: { product: { include: { category: true } } }, orderBy: { createdAt: 'asc' } },
      cashMovements: true,
    };
  }

  async findMany(query: PurchaseQueryDto) {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: this.include(),
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapPurchase(item)),
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  }

  findById(id: string) {
    return this.prisma.purchaseOrder.findUnique({ where: { id }, include: this.include() });
  }

  mapPurchase(purchase: any) {
    return {
      ...purchase,
      subtotal: Number(purchase.subtotal),
      taxTotal: Number(purchase.taxTotal),
      discount: Number(purchase.discount),
      total: Number(purchase.total),
      items: purchase.items?.map((item: any) => ({
        ...item,
        unitCost: Number(item.unitCost),
        subtotal: Number(item.subtotal),
        product: item.product
          ? {
              ...item.product,
              purchasePrice: Number(item.product.purchasePrice),
              salePrice: Number(item.product.salePrice),
            }
          : item.product,
      })),
      cashMovements: purchase.cashMovements?.map((movement: any) => ({
        ...movement,
        amount: Number(movement.amount),
      })),
    };
  }

  private buildWhere(query: PurchaseQueryDto): Prisma.PurchaseOrderWhereInput {
    const where: Prisma.PurchaseOrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { supplier: { name: { contains: query.search, mode: 'insensitive' } } },
        { supplier: { ruc: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    return where;
  }
}
