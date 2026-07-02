import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { ServiceOrderQueryDto } from './dto/service-order-query.dto';

@Injectable()
export class ServiceOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ServiceOrderQueryDto) {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceOrder.findMany({
        where,
        include: this.include(),
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.serviceOrder.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapOrder(item)),
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  }

  findById(id: string) {
    return this.prisma.serviceOrder.findUnique({ where: { id }, include: this.include() });
  }

  logs(id: string) {
    return this.prisma.serviceOrderLog.findMany({
      where: { serviceOrderId: id },
      include: { user: this.userSafeInclude() },
      orderBy: { createdAt: 'desc' },
    });
  }

  include() {
    return {
      customer: true,
      user: this.userSafeInclude(),
      items: { include: { product: true } },
      logs: { include: { user: this.userSafeInclude() }, orderBy: { createdAt: 'desc' } },
    } satisfies Prisma.ServiceOrderInclude;
  }

  private userSafeInclude() {
    return {
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    } satisfies Prisma.UserDefaultArgs;
  }

  mapOrder(order: any) {
    return {
      ...order,
      laborCost: Number(order.laborCost),
      partsCost: Number(order.partsCost),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items?.map((item: any) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
      })),
    };
  }

  private buildWhere(query: ServiceOrderQueryDto): Prisma.ServiceOrderWhereInput {
    const where: Prisma.ServiceOrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { customer: { fullName: { contains: query.search, mode: 'insensitive' } } },
        { equipmentType: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    return where;
  }
}
