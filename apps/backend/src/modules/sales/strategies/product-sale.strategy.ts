import { BadRequestException, Injectable } from '@nestjs/common';
import { InventoryMovementType, Prisma, SaleItemType } from '@prisma/client';

import { SaleItemDto } from '../dto/sale-item.dto';

@Injectable()
export class ProductSaleStrategy {
  async validateAndBuild(
    tx: Prisma.TransactionClient,
    item: SaleItemDto,
    userId: string,
  ) {
    if (item.itemType !== SaleItemType.PRODUCT || !item.productId) {
      throw new BadRequestException('El POS solo permite venta de productos en esta fase');
    }

    const product = await tx.product.findUnique({
      where: { id: item.productId },
    });

    if (!product || !product.isActive) {
      throw new BadRequestException('Producto no disponible');
    }

    if (product.stock < item.quantity) {
      throw new BadRequestException(`Stock insuficiente para ${product.name}`);
    }

    const unitPrice = Number(product.salePrice);
    const subtotal = unitPrice * item.quantity;
    const discount = item.discount ?? 0;
    const total = Math.max(subtotal - discount, 0);
    const newStock = product.stock - item.quantity;

    return {
      product,
      saleItem: {
        productId: product.id,
        itemType: SaleItemType.PRODUCT,
        description: product.name,
        quantity: item.quantity,
        unitPrice,
        discount,
        subtotal,
        total,
      },
      stockUpdate: tx.product.updateMany({
        where: {
          id: product.id,
          stock: { gte: item.quantity },
        },
        data: { stock: { decrement: item.quantity } },
      }),
      movement: tx.inventoryMovement.create({
        data: {
          productId: product.id,
          type: InventoryMovementType.OUT,
          quantity: item.quantity,
          previousStock: product.stock,
          newStock,
          reason: 'Venta de producto',
          userId,
        },
      }),
    };
  }
}
