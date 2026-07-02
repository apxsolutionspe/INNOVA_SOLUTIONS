import { Injectable } from '@nestjs/common';
import { CashSessionStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { CashQueryDto } from './dto/cash-query.dto';

@Injectable()
export class CashRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOpenByUser(userId: string) {
    return this.prisma.cashSession.findFirst({
      where: { userId, status: CashSessionStatus.OPEN },
      include: this.include(),
      orderBy: { openedAt: 'desc' },
    });
  }

  findOpenAny() {
    return this.prisma.cashSession.findFirst({
      where: { status: CashSessionStatus.OPEN },
      include: this.include(),
      orderBy: { openedAt: 'desc' },
    });
  }

  findSessions(canSeeAll: boolean, userId: string) {
    return this.prisma.cashSession.findMany({
      where: canSeeAll ? {} : { userId },
      include: this.include(),
      orderBy: { openedAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.cashSession.findUnique({ where: { id }, include: this.include() });
  }

  findMovements(query: CashQueryDto, userId: string, canSeeAll: boolean) {
    return this.prisma.cashMovement.findMany({
      where: {
        type: query.type,
        paymentMethod: query.paymentMethod,
        cashSession: canSeeAll ? undefined : { userId },
      },
      include: { user: { include: { role: true } }, relatedSale: true },
      orderBy: { createdAt: 'desc' },
      take: 150,
    });
  }

  include() {
    return {
      user: { include: { role: true } },
      movements: { orderBy: { createdAt: 'desc' } },
    } satisfies Prisma.CashSessionInclude;
  }
}
