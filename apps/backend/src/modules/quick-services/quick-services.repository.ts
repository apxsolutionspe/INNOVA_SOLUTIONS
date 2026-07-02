import { Injectable } from '@nestjs/common';
import { Prisma, QuickServiceSaleStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { QuickServiceQueryDto } from './dto/quick-service-query.dto';

@Injectable()
export class QuickServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  categories() {
    return this.prisma.quickServiceCategory.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  }

  services(query: QuickServiceQueryDto) {
    return this.prisma.quickService.findMany({
      where: {
        isActive: true,
        categoryId: query.categoryId,
        name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  service(id: string) {
    return this.prisma.quickService.findUnique({ where: { id }, include: { category: true } });
  }

  sales() {
    return this.prisma.quickServiceSale.findMany({
      include: this.saleInclude(),
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  sale(id: string) {
    return this.prisma.quickServiceSale.findUnique({ where: { id }, include: this.saleInclude() });
  }

  saleInclude() {
    return {
      customer: true,
      user: { include: { role: true } },
      cashSession: true,
      items: { include: { quickService: { include: { category: true } } } },
    } satisfies Prisma.QuickServiceSaleInclude;
  }

  mapService(service: any) {
    return { ...service, unitPrice: Number(service.unitPrice), costPrice: service.costPrice === null ? null : Number(service.costPrice) };
  }

  mapSale(sale: any) {
    return {
      ...sale,
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      total: Number(sale.total),
      items: sale.items?.map((item: any) => ({ ...item, unitPrice: Number(item.unitPrice), subtotal: Number(item.subtotal) })),
    };
  }
}
