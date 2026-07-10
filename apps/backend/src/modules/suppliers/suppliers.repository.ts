import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: SupplierQueryDto) {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.supplier.findMany({ where, include: this.include(), skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.supplier.count({ where }),
    ]);

    return { items: items.map((item) => this.mapSupplier(item)), meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } };
  }

  findById(id: string) {
    return this.prisma.supplier.findUnique({ where: { id }, include: this.include() });
  }

  findByRuc(ruc: string) {
    return this.prisma.supplier.findUnique({ where: { ruc } });
  }

  create(dto: CreateSupplierDto) {
    const { products = [], ...supplierData } = dto;
    return this.prisma.supplier.create({
      data: {
        ...supplierData,
        products: products.length ? { create: products.map((product) => this.productCreateData(product)) } : undefined,
      },
      include: this.include(),
    }).then((supplier) => this.mapSupplier(supplier));
  }

  update(id: string, dto: UpdateSupplierDto) {
    const { products, ...supplierData } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (products) {
        await tx.supplierProduct.deleteMany({ where: { supplierId: id } });
      }
      const supplier = await tx.supplier.update({
        where: { id },
        data: {
          ...supplierData,
          products: products ? { create: products.map((product) => this.productCreateData(product)) } : undefined,
        },
        include: this.include(),
      });
      return this.mapSupplier(supplier);
    });
  }

  deactivate(id: string) {
    return this.prisma.supplier.update({ where: { id }, data: { isActive: false }, include: this.include() }).then((supplier) => this.mapSupplier(supplier));
  }

  async addProduct(supplierId: string, dto: NonNullable<CreateSupplierDto['products']>[number]) {
    await this.prisma.supplierProduct.create({
      data: {
        supplier: { connect: { id: supplierId } },
        ...this.productCreateData(dto),
      },
    });
    const supplier = await this.prisma.supplier.findUniqueOrThrow({ where: { id: supplierId }, include: this.include() });
    return this.mapSupplier(supplier);
  }

  async updateProduct(supplierId: string, itemId: string, dto: NonNullable<CreateSupplierDto['products']>[number]) {
    await this.prisma.supplierProduct.updateMany({ where: { id: itemId, supplierId }, data: this.productUpdateData(dto) });
    const supplier = await this.prisma.supplier.findUniqueOrThrow({ where: { id: supplierId }, include: this.include() });
    return this.mapSupplier(supplier);
  }

  async deactivateProduct(supplierId: string, itemId: string) {
    await this.prisma.supplierProduct.updateMany({ where: { id: itemId, supplierId }, data: { isActive: false } });
    const supplier = await this.prisma.supplier.findUniqueOrThrow({ where: { id: supplierId }, include: this.include() });
    return this.mapSupplier(supplier);
  }

  private include() {
    return {
      products: { include: { product: { include: { category: true } } }, orderBy: { createdAt: 'desc' } },
      _count: { select: { purchaseOrders: true } },
    } satisfies Prisma.SupplierInclude;
  }

  private productCreateData(dto: NonNullable<CreateSupplierDto['products']>[number]): Prisma.SupplierProductCreateWithoutSupplierInput {
    const lastCost = dto.lastCost ?? dto.referencePrice;
    const leadTime = dto.leadTime ?? dto.deliveryTime;

    return {
      product: dto.productId ? { connect: { id: dto.productId } } : undefined,
      name: dto.name,
      category: dto.category,
      unit: dto.unit,
      supplierSku: dto.supplierSku,
      referencePrice: dto.referencePrice ?? lastCost,
      lastCost,
      minOrderQuantity: dto.minOrderQuantity ?? 1,
      deliveryTime: dto.deliveryTime ?? leadTime,
      leadTime,
      availability: dto.availability,
      notes: dto.notes,
      isPreferred: dto.isPreferred ?? false,
      isActive: dto.isActive ?? true,
    };
  }

  private productUpdateData(dto: NonNullable<CreateSupplierDto['products']>[number]): Prisma.SupplierProductUncheckedUpdateManyInput {
    const lastCost = dto.lastCost ?? dto.referencePrice;
    const leadTime = dto.leadTime ?? dto.deliveryTime;

    return {
      productId: dto.productId || null,
      name: dto.name,
      category: dto.category,
      unit: dto.unit,
      supplierSku: dto.supplierSku || null,
      referencePrice: dto.referencePrice ?? lastCost,
      lastCost,
      minOrderQuantity: dto.minOrderQuantity ?? 1,
      deliveryTime: dto.deliveryTime ?? leadTime,
      leadTime,
      availability: dto.availability,
      notes: dto.notes,
      isPreferred: dto.isPreferred ?? false,
      isActive: dto.isActive ?? true,
    };
  }

  private mapSupplier(supplier: any) {
    return {
      ...supplier,
      products: supplier.products?.map((product: any) => ({
        ...product,
        referencePrice: product.referencePrice === null || product.referencePrice === undefined ? null : Number(product.referencePrice),
        lastCost: product.lastCost === null || product.lastCost === undefined ? null : Number(product.lastCost),
        product: product.product
          ? {
              ...product.product,
              purchasePrice: Number(product.product.purchasePrice),
              salePrice: Number(product.product.salePrice),
            }
          : product.product,
      })) ?? [],
    };
  }

  private buildWhere(query: SupplierQueryDto): Prisma.SupplierWhereInput {
    const where: Prisma.SupplierWhereInput = {};
    if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { ruc: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { whatsapp: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { contactName: { contains: query.search, mode: 'insensitive' } },
        { products: { some: { name: { contains: query.search, mode: 'insensitive' } } } },
        { products: { some: { category: { contains: query.search, mode: 'insensitive' } } } },
      ];
    }
    return where;
  }
}
