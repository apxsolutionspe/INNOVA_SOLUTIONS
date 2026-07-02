import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CashMovementType, CashSessionStatus, NotificationPriority, NotificationType, PaymentMethod, Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CashQueryDto } from './dto/cash-query.dto';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { OpenCashSessionDto } from './dto/open-cash-session.dto';
import { CashRepository } from './cash.repository';

@Injectable()
export class CashService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cashRepository: CashRepository,
  ) {}

  async open(dto: OpenCashSessionDto, user: AuthenticatedUser) {
    const existing = await this.cashRepository.findOpenByUser(user.id);
    if (existing) throw new BadRequestException('Ya tienes una caja abierta');
    const code = `CJ-${String((await this.prisma.cashSession.count()) + 1).padStart(6, '0')}`;
    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.cashSession.create({
        data: {
          code,
          userId: user.id,
          openingAmount: dto.openingAmount,
          expectedCashAmount: dto.openingAmount,
          realCashAmount: null,
          notes: dto.notes,
        },
        include: this.cashRepository.include(),
      });
      await this.audit(user.id, 'OPEN_CASH_SESSION', `Caja abierta: ${code}`, tx);
      return created;
    });
    return this.mapSession(session);
  }

  current(user: AuthenticatedUser) {
    return this.cashRepository.findOpenByUser(user.id).then((session) => session ? this.mapSession(session) : null);
  }

  sessions(user: AuthenticatedUser) {
    return this.cashRepository.findSessions(user.role.name === 'ADMIN', user.id).then((sessions) => sessions.map((session) => this.mapSession(session)));
  }

  async findSession(id: string, user: AuthenticatedUser) {
    const session = await this.cashRepository.findById(id);
    if (!session) throw new NotFoundException('Caja no encontrada');
    if (user.role.name !== 'ADMIN' && session.userId !== user.id) throw new ForbiddenException('No puedes ver esta caja');
    return this.mapSession(session);
  }

  movements(query: CashQueryDto, user: AuthenticatedUser) {
    return this.cashRepository.findMovements(query, user.id, user.role.name === 'ADMIN').then((items) => items.map((item) => this.mapMovement(item)));
  }

  async createMovement(dto: CreateCashMovementDto, user: AuthenticatedUser) {
    if (
      dto.type !== CashMovementType.INCOME &&
      dto.type !== CashMovementType.EXPENSE &&
      dto.type !== CashMovementType.ADJUSTMENT
    ) {
      throw new BadRequestException('Tipo de movimiento manual no permitido');
    }
    const movement = await this.prisma.$transaction(async (tx) => {
      const session = await tx.cashSession.findFirst({ where: { userId: user.id, status: CashSessionStatus.OPEN } });
      if (!session) throw new BadRequestException('Debes abrir caja antes de registrar movimientos');
      const created = await tx.cashMovement.create({
        data: {
          cashSessionId: session.id,
          userId: user.id,
          type: dto.type,
          concept: dto.concept,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          reference: dto.reference,
          notes: dto.notes,
        },
      });
      await this.audit(user.id, dto.type === CashMovementType.EXPENSE ? 'CREATE_CASH_EXPENSE' : 'CREATE_CASH_MOVEMENT', dto.concept, tx);
      return created;
    });
    return this.mapMovement(movement);
  }

  async close(dto: CloseCashSessionDto, user: AuthenticatedUser) {
    const session = await this.cashRepository.findOpenByUser(user.id);
    if (!session) throw new BadRequestException('No tienes caja abierta');
    const closed = await this.prisma.$transaction(async (tx) => {
      const activeSession = await tx.cashSession.findFirst({ where: { id: session.id, userId: user.id, status: CashSessionStatus.OPEN } });
      if (!activeSession) throw new BadRequestException('La caja ya no esta abierta');
      const movements = await tx.cashMovement.findMany({ where: { cashSessionId: activeSession.id } });
      const totals = this.buildSessionTotals(movements, Number(activeSession.openingAmount));
      const difference = dto.realCashAmount - totals.expectedCashAmount;
      const updated = await tx.cashSession.update({
        where: { id: activeSession.id },
        data: {
          ...totals,
          realCashAmount: dto.realCashAmount,
          difference,
          status: CashSessionStatus.CLOSED,
          closedAt: new Date(),
          notes: dto.notes ?? activeSession.notes,
        },
        include: this.cashRepository.include(),
      });
      await this.audit(user.id, 'CLOSE_CASH_SESSION', `Caja cerrada: ${updated.code}`, tx);
      if (Math.abs(difference) > 0) {
        await tx.notification.create({
          data: {
            userId: user.id,
            title: 'Diferencia de caja',
            message: `La caja ${updated.code} cerro con diferencia de S/ ${difference.toFixed(2)}`,
            type: NotificationType.CASH_DIFFERENCE,
            priority: Math.abs(difference) >= 50 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
            relatedModule: 'cash',
            relatedId: updated.id,
          },
        });
      }
      return updated;
    });
    return this.mapSession(closed);
  }

  async summary(user: AuthenticatedUser) {
    const session = await this.cashRepository.findOpenByUser(user.id);
    if (!session) return { currentCashStatus: 'CLOSED', totalCashToday: 0, totalYapeToday: 0, totalPlinToday: 0, totalTransferToday: 0, expensesToday: 0, netCashToday: 0 };
    const totals = await this.calculateSessionTotals(session.id, Number(session.openingAmount));
    return {
      currentCashStatus: session.status,
      totalCashToday: totals.totalCash,
      totalYapeToday: totals.totalYape,
      totalPlinToday: totals.totalPlin,
      totalTransferToday: totals.totalTransfer,
      expensesToday: totals.totalExpenses,
      netCashToday: totals.totalSales - totals.totalExpenses,
    };
  }

  async registerSaleMovement(tx: Prisma.TransactionClient, userId: string, saleId: string, payments: Array<{ method: PaymentMethod; amount: number; reference?: string }>) {
    const session = await tx.cashSession.findFirst({ where: { userId, status: CashSessionStatus.OPEN } });
    if (!session) throw new BadRequestException('Debe abrir caja antes de registrar ventas');
    for (const payment of payments) {
      await tx.cashMovement.create({
        data: {
          cashSessionId: session.id,
          userId,
          type: CashMovementType.SALE,
          concept: `Venta registrada`,
          amount: payment.amount,
          paymentMethod: payment.method,
          reference: payment.reference,
          relatedSaleId: saleId,
        },
      });
    }
  }

  async registerSaleCancellation(tx: Prisma.TransactionClient, userId: string, saleId: string, amount: number) {
    const session = await tx.cashSession.findFirst({ where: { userId, status: CashSessionStatus.OPEN } });
    if (!session) return;
    await tx.cashMovement.create({
      data: {
        cashSessionId: session.id,
        userId,
        type: CashMovementType.ADJUSTMENT,
        concept: 'Anulacion de venta',
        amount: -Math.abs(amount),
        paymentMethod: PaymentMethod.CASH,
        relatedSaleId: saleId,
      },
    });
  }

  private async calculateSessionTotals(sessionId: string, openingAmount: number) {
    const movements = await this.prisma.cashMovement.findMany({ where: { cashSessionId: sessionId } });
    return this.buildSessionTotals(movements, openingAmount);
  }

  private buildSessionTotals(
    movements: Array<{ type: CashMovementType; paymentMethod: PaymentMethod; amount: Prisma.Decimal | number }>,
    openingAmount: number,
  ) {
    const incomeTypes: CashMovementType[] = [CashMovementType.INCOME, CashMovementType.SALE, CashMovementType.SERVICE_PAYMENT, CashMovementType.ADJUSTMENT];
    const totalSales = movements.filter((m) => m.type === CashMovementType.SALE).reduce((s, m) => s + Number(m.amount), 0);
    const totalExpenses = movements.filter((m) => m.type === CashMovementType.EXPENSE).reduce((s, m) => s + Number(m.amount), 0);
    const totalCash = this.sumByMethod(movements, PaymentMethod.CASH, incomeTypes);
    const totalYape = this.sumByMethod(movements, PaymentMethod.YAPE, incomeTypes);
    const totalPlin = this.sumByMethod(movements, PaymentMethod.PLIN, incomeTypes);
    const totalTransfer = this.sumByMethod(movements, PaymentMethod.TRANSFER, incomeTypes);
    return { totalSales, totalExpenses, totalCash, totalYape, totalPlin, totalTransfer, expectedCashAmount: openingAmount + totalCash - totalExpenses };
  }

  private sumByMethod(
    movements: Array<{ type: CashMovementType; paymentMethod: PaymentMethod; amount: Prisma.Decimal | number }>,
    method: PaymentMethod,
    incomeTypes: CashMovementType[],
  ) {
    return movements.filter((m) => m.paymentMethod === method && incomeTypes.includes(m.type)).reduce((s, m) => s + Number(m.amount), 0);
  }

  private audit(userId: string, action: string, description: string, client: Prisma.TransactionClient | PrismaService = this.prisma) {
    return client.auditLog.create({ data: { userId, action, module: 'cash', description } });
  }

  private mapSession(session: any) {
    return {
      ...session,
      openingAmount: Number(session.openingAmount),
      expectedCashAmount: Number(session.expectedCashAmount),
      realCashAmount: session.realCashAmount === null ? null : Number(session.realCashAmount),
      difference: Number(session.difference),
      totalSales: Number(session.totalSales),
      totalExpenses: Number(session.totalExpenses),
      totalCash: Number(session.totalCash),
      totalYape: Number(session.totalYape),
      totalPlin: Number(session.totalPlin),
      totalTransfer: Number(session.totalTransfer),
      movements: session.movements?.map((movement: any) => this.mapMovement(movement)),
    };
  }

  private mapMovement(movement: any) {
    return { ...movement, amount: Number(movement.amount) };
  }
}
