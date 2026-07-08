import { Injectable } from '@nestjs/common';
import { InventoryMovementType, Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { buildCategorySearchTerms } from './utils/category-normalization.util';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProducts(query: ProductQueryDto) {
    const where = this.buildProductWhere(query);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
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

  findProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  findProductBySku(sku: string) {
    return this.prisma.product.findUnique({ where: { sku } });
  }

  findProductByBarcode(barcode: string) {
    return this.prisma.product.findUnique({ where: { barcode } });
  }

  createProduct(data: Prisma.ProductUncheckedCreateInput, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data,
        include: { category: true },
      });

      const initialStock = Number(data.stock ?? 0);

      if (initialStock > 0) {
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            type: InventoryMovementType.IN,
            quantity: initialStock,
            previousStock: 0,
            newStock: initialStock,
            reason: 'Stock inicial',
            userId,
          },
        });
      }

      return product;
    });
  }

  updateProduct(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  deactivateProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: { category: true },
    });
  }

  adjustStock(
    id: string,
    data: {
      type: InventoryMovementType;
      quantity: number;
      previousStock: number;
      newStock: number;
      reason: string;
      userId: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: { stock: data.newStock },
        include: { category: true },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: id,
          type: data.type,
          quantity: data.quantity,
          previousStock: data.previousStock,
          newStock: data.newStock,
          reason: data.reason,
          userId: data.userId,
        },
      });

      return product;
    });
  }

  findCategories() {
    return this.prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  findCategoryById(id: string) {
    return this.prisma.productCategory.findUnique({ where: { id } });
  }

  findCategoryByName(name: string) {
    return this.prisma.productCategory.findUnique({ where: { name } });
  }

  createCategory(data: CreateCategoryDto) {
    return this.prisma.productCategory.create({ data });
  }

  updateCategory(id: string, data: Partial<CreateCategoryDto>) {
    return this.prisma.productCategory.update({ where: { id }, data });
  }

  deactivateCategory(id: string) {
    return this.prisma.productCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }

  findMovements() {
    return this.prisma.inventoryMovement.findMany({
      include: { product: true, user: { include: { role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  findLowStock() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: this.prisma.product.fields.minStock },
      },
      include: { category: true },
      orderBy: { stock: 'asc' },
    });
  }

  summary() {
    return this.prisma.$transaction([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.productCategory.count({ where: { isActive: true } }),
      this.prisma.product.findMany({
        where: { isActive: true },
        select: { stock: true, minStock: true, purchasePrice: true },
      }),
    ]);
  }

  private buildProductWhere(query: ProductQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

    if (typeof query.isActive === 'boolean') {
      where.isActive = query.isActive;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      const categoryFilters: Prisma.ProductWhereInput[] = buildCategorySearchTerms(search).map((term) => ({
        category: { is: { name: { contains: term, mode: Prisma.QueryMode.insensitive } } },
      }));

      where.OR = [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { sku: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { barcode: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { brand: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { model: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { recommendedUse: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { salesNotes: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { technicalSpecsSearch: { contains: search.toLowerCase(), mode: Prisma.QueryMode.insensitive } },
        ...categoryFilters,
      ];
    }

    return where;
  }
}
