import { Injectable } from '@nestjs/common';
import { Prisma, SaleStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { SaleQueryDto } from './dto/sale-query.dto';

@Injectable()
export class SalesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: SaleQueryDto) {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        include: this.saleInclude(),
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      items: items.map((sale) => this.mapSale(sale)),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  findById(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: this.saleInclude(),
    });
  }

  mapSale(sale: any) {
    return {
      ...sale,
      subtotal: Number(sale.subtotal),
      discountTotal: Number(sale.discountTotal),
      taxTotal: Number(sale.taxTotal),
      total: Number(sale.total),
      applyIgv: Boolean(sale.applyIgv),
      igvRate: Number(sale.igvRate ?? 0),
      items: sale.items?.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        subtotal: Number(item.subtotal),
        total: Number(item.total),
      })),
      payments: sale.payments?.map((payment: any) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    };
  }

  saleInclude() {
    return {
      customer: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      items: { include: { product: true } },
      payments: true,
      cancellations: true,
    } satisfies Prisma.SaleInclude;
  }

  private buildWhere(query: SaleQueryDto): Prisma.SaleWhereInput {
    const where: Prisma.SaleWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { customer: { fullName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.from || query.to) {
      where.createdAt = {
        gte: query.from ? new Date(query.from) : undefined,
        lte: query.to ? new Date(query.to) : undefined,
      };
    }

    if (!query.status) {
      where.status = { in: [SaleStatus.COMPLETED, SaleStatus.CANCELLED] };
    }

    return where;
  }
}
