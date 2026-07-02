import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnlineOrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateOnlineOrderDto } from './dto/create-online-order.dto';
import { EcommerceProductQueryDto } from './dto/ecommerce-product-query.dto';
import { buildOnlineOrderCode } from './utils/online-order-code.util';

@Injectable()
export class EcommerceService {
  constructor(private readonly prisma: PrismaService) {}

  products(query: EcommerceProductQueryDto) {
    return this.prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0 }, categoryId: query.categoryId, name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined },
      include: { category: true },
      orderBy: { name: 'asc' },
      take: 80,
    }).then((items) => items.map((item) => ({ ...item, purchasePrice: undefined, salePrice: Number(item.salePrice) })));
  }

  async product(id: string) {
    const product = await this.prisma.product.findFirst({ where: { id, isActive: true }, include: { category: true } });
    if (!product) throw new NotFoundException('Producto no disponible');
    return { ...product, purchasePrice: undefined, salePrice: Number(product.salePrice) };
  }

  orders() {
    return this.prisma.onlineOrder.findMany({ include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }).then((orders) => orders.map((order) => this.mapOrder(order)));
  }

  async order(id: string) {
    const order = await this.prisma.onlineOrder.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
    if (!order) throw new NotFoundException('Pedido online no encontrado');
    return this.mapOrder(order);
  }

  async createOrder(dto: CreateOnlineOrderDto) {
    if (!dto.items.length) throw new BadRequestException('El pedido debe incluir productos');
    return this.prisma.$transaction(async (tx) => {
      const items = [];
      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || !product.isActive || product.stock < item.quantity) throw new BadRequestException('Producto no disponible para tienda online');
        const unitPrice = Number(product.salePrice);
        items.push({ productId: product.id, quantity: item.quantity, unitPrice, subtotal: unitPrice * item.quantity });
      }
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const deliveryCost = dto.deliveryCost ?? 0;
      const code = buildOnlineOrderCode((await tx.onlineOrder.count()) + 1);
      const order = await tx.onlineOrder.create({
        data: { code, customerName: dto.customerName, customerPhone: dto.customerPhone, customerEmail: dto.customerEmail, deliveryAddress: dto.deliveryAddress, subtotal, deliveryCost, total: subtotal + deliveryCost, paymentMethod: dto.paymentMethod, notes: dto.notes, items: { create: items } },
        include: { items: { include: { product: true } } },
      });
      await tx.auditLog.create({ data: { module: 'ecommerce', action: 'CREATE_ONLINE_ORDER', description: `Pedido eCommerce creado ${code}`, entityId: order.id, entityType: 'OnlineOrder' } });
      return this.mapOrder(order);
    });
  }

  async updateStatus(id: string, status: OnlineOrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.onlineOrder.findUnique({ where: { id }, include: { items: true } });
      if (!existing) throw new NotFoundException('Pedido online no encontrado');
      if (status === OnlineOrderStatus.CONFIRMED && existing.status !== OnlineOrderStatus.CONFIRMED) {
        for (const item of existing.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.stock < item.quantity) throw new BadRequestException('Stock insuficiente para confirmar pedido online');
        }
      }
      const order = await tx.onlineOrder.update({ where: { id }, data: { status }, include: { items: { include: { product: true } } } });
      await tx.auditLog.create({ data: { module: 'ecommerce', action: 'UPDATE_ONLINE_ORDER_STATUS', description: `Pedido ${order.code} actualizado a ${status}`, entityId: id, entityType: 'OnlineOrder' } });
      return this.mapOrder(order);
    });
  }

  private mapOrder(order: any) {
    return { ...order, subtotal: Number(order.subtotal), deliveryCost: Number(order.deliveryCost), total: Number(order.total), items: order.items?.map((item: any) => ({ ...item, unitPrice: Number(item.unitPrice), subtotal: Number(item.subtotal) })) };
  }
}
