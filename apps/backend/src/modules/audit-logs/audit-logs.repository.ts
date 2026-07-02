import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: AuditLogQueryDto) {
    const where: Prisma.AuditLogWhereInput = {
      userId: query.userId,
      module: query.module,
      action: query.action,
      createdAt: query.startDate || query.endDate ? { gte: query.startDate ? new Date(query.startDate) : undefined, lte: query.endDate ? new Date(query.endDate) : undefined } : undefined,
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, skip, take: query.limit, include: { user: { select: { id: true, fullName: true, email: true, role: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } };
  }

  findById(id: string) {
    return this.prisma.auditLog.findUnique({ where: { id }, include: { user: { select: { id: true, fullName: true, email: true, role: true } } } });
  }
}
