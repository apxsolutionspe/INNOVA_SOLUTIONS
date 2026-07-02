import { Injectable } from '@nestjs/common';
import { DocumentType, Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { CustomerQueryDto } from './dto/customer-query.dto';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: CustomerQueryDto) {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  findById(id: string) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  findByDocument(documentType: DocumentType, documentNumber: string) {
    return this.prisma.customer.findUnique({
      where: { documentType_documentNumber: { documentType, documentNumber } },
    });
  }

  create(data: Prisma.CustomerUncheckedCreateInput) {
    return this.prisma.customer.create({ data });
  }

  update(id: string, data: Prisma.CustomerUncheckedUpdateInput) {
    return this.prisma.customer.update({ where: { id }, data });
  }

  deactivate(id: string) {
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  setStatus(id: string, isActive: boolean) {
    return this.prisma.customer.update({
      where: { id },
      data: { isActive },
    });
  }

  private buildWhere(query: CustomerQueryDto): Prisma.CustomerWhereInput {
    const where: Prisma.CustomerWhereInput = {};

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.customerType) {
      where.customerType = query.customerType;
    }

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { businessName: { contains: query.search, mode: 'insensitive' } },
        { tradeName: { contains: query.search, mode: 'insensitive' } },
        { documentNumber: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
