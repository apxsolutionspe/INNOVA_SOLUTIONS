import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  InventoryMovementType,
  PaymentMethod,
  PaymentStatus,
  SaleStatus,
} from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CashService } from '../cash/cash.service';
import { CancelSaleDto } from './dto/cancel-sale.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleQueryDto } from './dto/sale-query.dto';
import { SaleFacade } from './facades/sale.facade';
import { ReceiptPdfService } from './pdf/receipt-pdf.service';
import { SalesRepository } from './sales.repository';
import { ProductSaleStrategy } from './strategies/product-sale.strategy';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly salesRepository: SalesRepository,
    private readonly productSaleStrategy: ProductSaleStrategy,
    private readonly saleFacade: SaleFacade,
    private readonly receiptPdfService: ReceiptPdfService,
    private readonly cashService: CashService,
  ) {}

  findAll(query: SaleQueryDto) {
    return this.salesRepository.findMany(query);
  }

  async findOne(id: string) {
    const sale = await this.salesRepository.findById(id);

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    return this.salesRepository.mapSale(sale);
  }

  async create(dto: CreateSaleDto, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.customerId) {
        const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });

        if (!customer || !customer.isActive) {
          throw new BadRequestException('Cliente no disponible');
        }
      }

      this.validatePayments(dto);

      const builtItems = [];
      for (const item of dto.items) {
        builtItems.push(await this.productSaleStrategy.validateAndBuild(tx, item, user.id));
      }

      const businessSettings = await tx.businessSettings.findFirst();
      const applyIgv = Boolean(businessSettings?.applyIgv);
      const igvRate = Number(businessSettings?.taxPercentage ?? 18) / 100;
      const totals = this.saleFacade.calculateTotals(builtItems.map((item) => item.saleItem), { applyIgv, igvRate });
      const paidAmount = dto.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const paymentStatus = this.resolvePaymentStatus(paidAmount, totals.total);
      const code = await this.generateSaleCode(tx);

      const sale = await tx.sale.create({
        data: {
          code,
          customerId: dto.customerId,
          userId: user.id,
          subtotal: totals.subtotal,
          discountTotal: totals.discountTotal,
          taxTotal: totals.taxTotal,
          total: totals.total,
          applyIgv: totals.applyIgv,
          igvRate: totals.igvRate,
          paymentStatus,
          status: SaleStatus.COMPLETED,
          notes: dto.notes,
          items: { create: builtItems.map((item) => item.saleItem) },
          payments: {
            create: dto.payments.map((payment) => ({
              method: payment.method,
              amount: payment.amount,
              reference: payment.reference,
            })),
          },
        },
        include: this.salesRepository.saleInclude(),
      });

      for (const item of builtItems) {
        const stockUpdate = await item.stockUpdate;
        if (stockUpdate.count !== 1) {
          throw new BadRequestException(`Stock insuficiente para ${item.product.name}`);
        }
        await item.movement;
      }

      await this.cashService.registerSaleMovement(
        tx,
        user.id,
        sale.id,
        dto.payments.map((payment) => ({
          method: payment.method,
          amount: payment.amount,
          reference: payment.reference,
        })),
      );

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_SALE',
          module: 'sales',
          description: `Venta registrada: ${sale.code}`,
        },
      });

      return this.salesRepository.mapSale(sale);
    });
  }

  async cancel(id: string, dto: CancelSaleDto, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!sale) {
        throw new NotFoundException('Venta no encontrada');
      }

      if (sale.status === SaleStatus.CANCELLED) {
        throw new BadRequestException('La venta ya fue anulada');
      }

      for (const item of sale.items) {
        if (!item.productId) continue;

        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) continue;

        const newStock = product.stock + item.quantity;
        await tx.product.update({
          where: { id: product.id },
          data: { stock: newStock },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            type: InventoryMovementType.IN,
            quantity: item.quantity,
            previousStock: product.stock,
            newStock,
            reason: `Anulacion de venta ${sale.code}`,
            userId: user.id,
          },
        });
      }

      await tx.sale.update({
        where: { id },
        data: { status: SaleStatus.CANCELLED },
      });
      await tx.saleCancellation.create({
        data: {
          saleId: id,
          userId: user.id,
          reason: dto.reason,
        },
      });
      await this.cashService.registerSaleCancellation(tx, user.id, id, Number(sale.total));
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'CANCEL_SALE',
          module: 'sales',
          description: `Venta anulada: ${sale.code}. Motivo: ${dto.reason}`,
        },
      });

      const updated = await tx.sale.findUnique({
        where: { id },
        include: this.salesRepository.saleInclude(),
      });
      return this.salesRepository.mapSale(updated);
    });
  }

  async receipt(id: string) {
    const sale = await this.findOne(id);
    return {
      sale,
      html: this.receiptPdfService.buildReceiptHtml(sale),
    };
  }

  async receiptPdf(id: string) {
    const sale = await this.findOne(id);
    return {
      sale,
      filename: `comprobante-${sale.code}.pdf`,
      buffer: await this.receiptPdfService.buildReceiptPdfBuffer(sale),
    };
  }

  private validatePayments(dto: CreateSaleDto) {
    const hasMixed = dto.payments.some((payment) => payment.method === PaymentMethod.MIXED);

    if (hasMixed && dto.payments.length === 1) {
      throw new BadRequestException('El pago mixto debe incluir mas de un pago');
    }
  }

  private resolvePaymentStatus(paidAmount: number, total: number) {
    if (paidAmount >= total) return PaymentStatus.PAID;
    if (paidAmount > 0) return PaymentStatus.PARTIAL;
    return PaymentStatus.PENDING;
  }

  private async generateSaleCode(tx: any) {
    const count = await tx.sale.count();
    return `V-${String(count + 1).padStart(6, '0')}`;
  }
}
