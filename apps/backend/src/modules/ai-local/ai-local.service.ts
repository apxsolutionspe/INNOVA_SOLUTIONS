import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CashMovementType, ServiceOrderStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AiLocalQueryDto } from './dto/ai-local-query.dto';
import { RebuildIndexDto } from './dto/rebuild-index.dto';
import { AiLocalHealth, AiLocalResponse } from './interfaces/ai-local-response.interface';
import { AiLocalHttpProvider } from './providers/ai-local-http.provider';

@Injectable()
export class AiLocalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly http: AiLocalHttpProvider,
    private readonly config: ConfigService,
  ) {}

  health() {
    return this.http.get<AiLocalHealth>('/health');
  }

  indexStatus() {
    return this.http.get<Record<string, unknown>>('/index/status');
  }

  async ask(dto: AiLocalQueryDto, user: AuthenticatedUser) {
    if (this.config.get<string>('AI_LOCAL_ENABLED') === 'false') {
      throw new ForbiddenException('IA local no esta habilitada');
    }
    const context = await this.buildBusinessContext();
    const response = await this.http.post<AiLocalResponse>('/chat', {
      question: dto.question,
      context,
      use_rag: dto.useRag ?? true,
      mode: 'business',
    });
    await this.audit(user.id, 'ASK', `Consulta realizada a IA local: ${dto.question}`);
    return { question: dto.question, generatedAt: new Date().toISOString(), ...response };
  }

  async rebuildIndex(dto: RebuildIndexDto, user: AuthenticatedUser) {
    if (this.config.get<string>('AI_LOCAL_ALLOW_REBUILD_INDEX') === 'false') {
      throw new ForbiddenException('Reconstruccion de indice no habilitada');
    }
    const context = await this.buildBusinessContext();
    const response = await this.http.post<Record<string, unknown>>('/index/rebuild', {
      business_context: context,
      include_docs: dto.includeDocs ?? true,
    });
    await this.audit(user.id, 'REBUILD_INDEX', 'Reconstruccion de indice vectorial');
    return response;
  }

  private async buildBusinessContext() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(startOfToday);
    startOfMonth.setDate(1);

    const [
      lowStock,
      outOfStock,
      topSaleItems,
      salesToday,
      incomeToday,
      incomeMonth,
      paymentMethods,
      cashSession,
      cashMovements,
      quickServices,
      serviceOrders,
      purchases,
      suppliersCount,
      productMargins,
      serviceMargins,
    ] = await Promise.all([
      this.prisma.product.findMany({
        where: { isActive: true, stock: { lte: this.prisma.product.fields.minStock } },
        select: { name: true, sku: true, stock: true, minStock: true, salePrice: true, category: { select: { name: true } } },
        orderBy: { stock: 'asc' },
        take: 15,
      }),
      this.prisma.product.findMany({
        where: { isActive: true, stock: 0 },
        select: { name: true, sku: true, stock: true, minStock: true, category: { select: { name: true } } },
        take: 15,
      }),
      this.prisma.saleItem.groupBy({
        by: ['description'],
        where: { sale: { status: 'COMPLETED' } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      this.prisma.sale.count({ where: { status: 'COMPLETED', createdAt: { gte: startOfToday } } }),
      this.prisma.sale.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startOfToday } }, _sum: { total: true } }),
      this.prisma.sale.aggregate({ where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } }, _sum: { total: true }, _count: true }),
      this.prisma.payment.groupBy({ by: ['method'], _sum: { amount: true }, _count: true }),
      this.prisma.cashSession.findFirst({ where: { status: 'OPEN' }, orderBy: { openedAt: 'desc' } }),
      this.prisma.cashMovement.findMany({ orderBy: { createdAt: 'desc' }, take: 40 }),
      this.prisma.quickServiceSaleItem.groupBy({ by: ['description'], _sum: { quantity: true, subtotal: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 10 }),
      this.prisma.serviceOrder.groupBy({ by: ['status'], _count: true }),
      this.prisma.purchaseOrder.groupBy({ by: ['status'], _sum: { total: true }, _count: true }),
      this.prisma.supplier.count({ where: { isActive: true } }),
      this.prisma.product.findMany({ where: { isActive: true }, select: { name: true, salePrice: true, purchasePrice: true, stock: true }, take: 20 }),
      this.prisma.quickService.findMany({ where: { isActive: true }, select: { name: true, unitPrice: true, costPrice: true }, take: 20 }),
    ]);

    const incomeTypes: CashMovementType[] = [CashMovementType.INCOME, CashMovementType.SALE, CashMovementType.SERVICE_PAYMENT, CashMovementType.ADJUSTMENT];
    const cashIncome = cashMovements.filter((movement) => incomeTypes.includes(movement.type)).reduce((sum, movement) => sum + Number(movement.amount), 0);
    const cashExpenses = cashMovements.filter((movement) => movement.type === CashMovementType.EXPENSE).reduce((sum, movement) => sum + Number(movement.amount), 0);
    const estimatedProductProfit = productMargins.reduce((sum, product) => sum + (Number(product.salePrice) - Number(product.purchasePrice)) * Number(product.stock), 0);
    const estimatedServiceMargin = serviceMargins.reduce((sum, service) => sum + (Number(service.unitPrice) - Number(service.costPrice ?? 0)), 0);

    return {
      inventory: {
        lowStock: lowStock.map((product) => ({ ...product, salePrice: Number(product.salePrice), category: product.category.name })),
        outOfStock: outOfStock.map((product) => ({ ...product, category: product.category.name })),
        topProductsSold: topSaleItems.map((item) => ({ name: item.description, quantity: item._sum.quantity ?? 0, total: Number(item._sum.total ?? 0) })),
      },
      sales: {
        salesToday,
        incomeToday: Number(incomeToday._sum.total ?? 0),
        incomeMonth: Number(incomeMonth._sum.total ?? 0),
        salesMonth: incomeMonth._count,
        paymentMethods: paymentMethods.map((item) => ({ method: item.method, amount: Number(item._sum.amount ?? 0), count: item._count })),
      },
      cash: {
        currentCashStatus: cashSession?.status ?? 'CLOSED',
        income: cashIncome,
        expenses: cashExpenses,
        net: cashIncome - cashExpenses,
        difference: cashSession ? Number(cashSession.difference) : 0,
      },
      quickServices: quickServices.map((item) => ({ name: item.description, quantity: item._sum.quantity ?? 0, income: Number(item._sum.subtotal ?? 0) })),
      serviceOrders: {
        byStatus: serviceOrders.map((item) => ({ status: item.status, count: item._count })),
        pending: serviceOrders
          .filter((item) =>
            item.status === ServiceOrderStatus.RECEIVED ||
            item.status === ServiceOrderStatus.DIAGNOSIS ||
            item.status === ServiceOrderStatus.IN_PROGRESS,
          )
          .reduce((sum, item) => sum + item._count, 0),
      },
      purchases: {
        byStatus: purchases.map((item) => ({ status: item.status, count: item._count, total: Number(item._sum.total ?? 0) })),
        suppliersCount,
      },
      profitability: {
        estimatedProductProfit,
        estimatedServiceMargin,
        estimatedNetProfit: Number(incomeMonth._sum.total ?? 0) + estimatedServiceMargin - cashExpenses,
      },
    };
  }

  private audit(userId: string, action: string, description: string) {
    return this.prisma.auditLog.create({ data: { userId, module: 'AI_LOCAL', action, description, entityType: 'AI_LOCAL' } });
  }
}
