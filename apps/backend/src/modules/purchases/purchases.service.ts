import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CashMovementType,
  CashSessionStatus,
  InventoryMovementType,
  PaymentMethod,
  Prisma,
  PurchaseOrderStatus,
  PurchasePaymentStatus,
} from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CancelPurchaseOrderDto } from './dto/cancel-purchase-order.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { PURCHASE_TAX_RATE } from './enums/purchase.enum';
import { PurchasesRepository } from './purchases.repository';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly purchasesRepository: PurchasesRepository,
  ) {}

  findAll(query: PurchaseQueryDto) {
    return this.purchasesRepository.findMany(query);
  }

  async findOne(id: string) {
    const purchase = await this.purchasesRepository.findById(id);
    if (!purchase) throw new NotFoundException('Orden de compra no encontrada');
    return this.purchasesRepository.mapPurchase(purchase);
  }

  async create(dto: CreatePurchaseOrderDto, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({ where: { id: dto.supplierId } });
      if (!supplier || !supplier.isActive) throw new BadRequestException('Proveedor no disponible');
      if (!dto.items.length) throw new BadRequestException('La compra debe incluir productos');

      const seenProductIds = new Set<string>();
      const items = [];
      for (const item of dto.items) {
        if (seenProductIds.has(item.productId)) {
          throw new BadRequestException('No se permiten productos duplicados en la misma compra');
        }
        seenProductIds.add(item.productId);

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || !product.isActive) throw new BadRequestException('Producto no disponible');

        const supplierProduct = await tx.supplierProduct.findFirst({
          where: {
            supplierId: dto.supplierId,
            productId: product.id,
            isActive: true,
          },
        });

        if (!supplierProduct) {
          throw new BadRequestException('Este producto no pertenece al catálogo del proveedor seleccionado');
        }

        items.push({
          productId: product.id,
          quantity: item.quantity,
          unitCost: item.unitCost,
          subtotal: item.quantity * item.unitCost,
        });
      }

      const totals = this.calculateTotals(items, dto.discount ?? 0);
      const paymentStatus = dto.paymentStatus ?? PurchasePaymentStatus.PENDING;
      if (dto.payFromCash && paymentStatus !== PurchasePaymentStatus.PAID) {
        throw new BadRequestException('Solo se registra pago en caja cuando la compra está pagada');
      }
      if (dto.payFromCash && !dto.paymentMethod) {
        throw new BadRequestException('Método de pago requerido para registrar gasto en caja');
      }

      const code = await this.generateCode(tx);
      const purchase = await tx.purchaseOrder.create({
        data: {
          code,
          supplierId: dto.supplierId,
          userId: user.id,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          discount: totals.discount,
          total: totals.total,
          paymentStatus,
          paymentMethod: dto.paymentMethod,
          reference: dto.reference,
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
          notes: dto.notes,
          items: { create: items },
        },
        include: this.purchasesRepository.include(),
      });

      if (dto.payFromCash && dto.paymentMethod) {
        await this.registerCashExpense(tx, user.id, purchase.id, code, totals.total, dto.paymentMethod, dto.reference);
      }

      await tx.auditLog.create({
        data: { userId: user.id, action: 'CREATE_PURCHASE_ORDER', module: 'purchases', description: `Compra creada: ${code}` },
      });

      return this.purchasesRepository.mapPurchase(purchase);
    });
  }

  async update(id: string, dto: Partial<CreatePurchaseOrderDto>, user: AuthenticatedUser) {
    const current = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Orden de compra no encontrada');
    if (current.status === PurchaseOrderStatus.RECEIVED || current.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('No se puede modificar una compra recibida o cancelada');
    }

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        paymentStatus: dto.paymentStatus,
        paymentMethod: dto.paymentMethod,
        reference: dto.reference,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        notes: dto.notes,
      },
      include: this.purchasesRepository.include(),
    });
    await this.audit(user.id, 'UPDATE_PURCHASE_ORDER', `Compra editada: ${updated.code}`);
    return this.purchasesRepository.mapPurchase(updated);
  }

  async receive(id: string, dto: ReceivePurchaseOrderDto, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const purchase = await tx.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
      if (!purchase) throw new NotFoundException('Orden de compra no encontrada');
      if (purchase.status === PurchaseOrderStatus.CANCELLED) throw new BadRequestException('No se puede recibir una compra cancelada');
      if (purchase.status === PurchaseOrderStatus.RECEIVED) throw new BadRequestException('La compra ya fue recibida');

      const receiveMap = new Map(dto.items?.map((item) => [item.itemId, item.receivedQuantity]));

      for (const item of purchase.items) {
        const remaining = item.quantity - item.receivedQuantity;
        const quantityToReceive = dto.items?.length ? receiveMap.get(item.id) ?? 0 : remaining;
        if (quantityToReceive <= 0) continue;
        if (quantityToReceive > remaining) throw new BadRequestException('La cantidad recibida supera lo pendiente');

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException('Producto no encontrado');
        const newStock = product.stock + quantityToReceive;
        await tx.product.update({
          where: { id: product.id },
          data: { stock: newStock, purchasePrice: item.unitCost },
        });
        await tx.purchaseOrderItem.update({
          where: { id: item.id },
          data: { receivedQuantity: item.receivedQuantity + quantityToReceive },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            type: InventoryMovementType.IN,
            quantity: quantityToReceive,
            previousStock: product.stock,
            newStock,
            reason: `Recepción de compra ${purchase.code}`,
            userId: user.id,
          },
        });
      }

      const refreshedItems = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: id } });
      const isReceived = refreshedItems.every((item) => item.receivedQuantity >= item.quantity);
      const hasReceived = refreshedItems.some((item) => item.receivedQuantity > 0);
      const status = isReceived ? PurchaseOrderStatus.RECEIVED : hasReceived ? PurchaseOrderStatus.PARTIALLY_RECEIVED : PurchaseOrderStatus.PENDING;
      const updated = await tx.purchaseOrder.update({
        where: { id },
        data: { status, receivedAt: isReceived ? new Date() : undefined, notes: dto.notes ?? purchase.notes },
        include: this.purchasesRepository.include(),
      });
      await tx.auditLog.create({
        data: { userId: user.id, action: 'RECEIVE_PURCHASE_ORDER', module: 'purchases', description: `Compra recibida: ${purchase.code}` },
      });
      return this.purchasesRepository.mapPurchase(updated);
    });
  }

  async cancel(id: string, dto: CancelPurchaseOrderDto, user: AuthenticatedUser) {
    const purchase = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!purchase) throw new NotFoundException('Orden de compra no encontrada');
    if (purchase.status === PurchaseOrderStatus.RECEIVED) throw new BadRequestException('No se puede cancelar una compra recibida');
    if (purchase.status === PurchaseOrderStatus.CANCELLED) throw new BadRequestException('La compra ya fue cancelada');
    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.CANCELLED, notes: purchase.notes ? `${purchase.notes}\nCancelación: ${dto.reason}` : `Cancelación: ${dto.reason}` },
      include: this.purchasesRepository.include(),
    });
    await this.audit(user.id, 'CANCEL_PURCHASE_ORDER', `Compra cancelada: ${purchase.code}. Motivo: ${dto.reason}`);
    return this.purchasesRepository.mapPurchase(updated);
  }

  async receipt(id: string) {
    const purchase = await this.findOne(id);
    const rows = purchase.items.map((item: any) => `<tr><td>${item.product.name}</td><td>${item.quantity}</td><td>${item.receivedQuantity}</td><td>S/ ${item.unitCost.toFixed(2)}</td><td>S/ ${item.subtotal.toFixed(2)}</td></tr>`).join('');
    return {
      purchase,
      html: `<!doctype html><html><body><h1>Innova Solutions</h1><p><strong>Orden:</strong> ${purchase.code}</p><p><strong>Proveedor:</strong> ${purchase.supplier.name}</p><p><strong>Responsable:</strong> ${purchase.user.fullName}</p><table>${rows}</table><p>IGV: S/ ${purchase.taxTotal.toFixed(2)}</p><h2>Total: S/ ${purchase.total.toFixed(2)}</h2><p>Documento interno de compra y abastecimiento.</p></body></html>`,
    };
  }

  private calculateTotals(items: Array<{ subtotal: number }>, discount: number) {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxable = Math.max(subtotal - discount, 0);
    const taxTotal = Number((taxable * PURCHASE_TAX_RATE).toFixed(2));
    const total = Number((taxable + taxTotal).toFixed(2));
    return { subtotal, discount, taxTotal, total };
  }

  private async registerCashExpense(tx: Prisma.TransactionClient, userId: string, purchaseId: string, code: string, amount: number, method: PaymentMethod, reference?: string) {
    const session = await tx.cashSession.findFirst({ where: { userId, status: CashSessionStatus.OPEN } });
    if (!session) throw new BadRequestException('Debe abrir caja antes de pagar compras desde caja');
    await tx.cashMovement.create({
      data: {
        cashSessionId: session.id,
        userId,
        type: CashMovementType.EXPENSE,
        concept: `Compra de productos - ${code}`,
        amount,
        paymentMethod: method,
        reference,
        relatedPurchaseOrderId: purchaseId,
      },
    });
  }

  private async generateCode(tx: Prisma.TransactionClient) {
    const count = await tx.purchaseOrder.count();
    return `OC-${String(count + 1).padStart(6, '0')}`;
  }

  private audit(userId: string, action: string, description: string) {
    return this.prisma.auditLog.create({ data: { userId, action, module: 'purchases', description } });
  }
}
