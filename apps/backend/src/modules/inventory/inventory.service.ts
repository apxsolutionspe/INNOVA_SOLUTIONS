import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryMovementType, Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InventoryRepository } from './inventory.repository';
import { normalizeCategoryName } from './utils/category-normalization.util';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findProducts(query: ProductQueryDto) {
    const result = await this.inventoryRepository.findProducts(query);
    return {
      ...result,
      items: result.items.map((product) => this.mapProduct(product)),
    };
  }

  async findProduct(id: string) {
    const product = await this.inventoryRepository.findProductById(id);

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.mapProduct(product);
  }

  async createProduct(dto: CreateProductDto, user: AuthenticatedUser) {
    const payload = this.normalizeProductPayload(dto);
    await this.ensureCategoryExists(payload.categoryId);
    await this.ensureUniqueProduct(payload.sku, payload.barcode);

    const product = await this.inventoryRepository.createProduct(payload as Prisma.ProductUncheckedCreateInput, user.id);
    await this.audit(user.id, 'CREATE_PRODUCT', `Producto creado: ${product.name}`);
    return this.mapProduct(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto, user: AuthenticatedUser) {
    const current = await this.inventoryRepository.findProductById(id);

    if (!current) {
      throw new NotFoundException('Producto no encontrado');
    }

    const payload = this.normalizeProductPayload(dto);

    if (payload.categoryId) {
      await this.ensureCategoryExists(payload.categoryId);
    }

    if ((payload.sku && payload.sku !== current.sku) || (payload.barcode && payload.barcode !== current.barcode)) {
      await this.ensureUniqueProduct(payload.sku, payload.barcode);
    }

    const product = await this.inventoryRepository.updateProduct(id, payload as Prisma.ProductUncheckedUpdateInput);
    await this.audit(user.id, 'UPDATE_PRODUCT', `Producto editado: ${product.name}`);
    return this.mapProduct(product);
  }

  async deactivateProduct(id: string, user: AuthenticatedUser) {
    const current = await this.inventoryRepository.findProductById(id);

    if (!current) {
      throw new NotFoundException('Producto no encontrado');
    }

    const product = await this.inventoryRepository.deactivateProduct(id);
    await this.audit(user.id, 'DEACTIVATE_PRODUCT', `Producto desactivado: ${product.name}`);
    return this.mapProduct(product);
  }

  async adjustStock(id: string, dto: AdjustStockDto, user: AuthenticatedUser) {
    const product = await this.inventoryRepository.findProductById(id);

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const previousStock = product.stock;
    const newStock = this.resolveNewStock(previousStock, dto.type, dto.quantity);

    const updated = await this.inventoryRepository.adjustStock(id, {
      type: dto.type,
      quantity: dto.quantity,
      previousStock,
      newStock,
      reason: dto.reason,
      userId: user.id,
    });
    await this.audit(
      user.id,
      'ADJUST_STOCK',
      `Stock ajustado para ${updated.name}: ${previousStock} -> ${newStock}`,
    );
    return this.mapProduct(updated);
  }

  findCategories() {
    return this.inventoryRepository.findCategories();
  }

  async createCategory(dto: CreateCategoryDto) {
    const data = { ...dto, name: normalizeCategoryName(dto.name) };
    await this.ensureUniqueCategory(data.name);
    return this.inventoryRepository.createCategory(data);
  }

  async updateCategory(id: string, dto: CreateCategoryDto) {
    const current = await this.inventoryRepository.findCategoryById(id);

    if (!current) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const data = { ...dto, name: normalizeCategoryName(dto.name) };

    if (data.name !== current.name) {
      await this.ensureUniqueCategory(data.name);
    }

    return this.inventoryRepository.updateCategory(id, data);
  }

  async deactivateCategory(id: string) {
    const current = await this.inventoryRepository.findCategoryById(id);

    if (!current) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return this.inventoryRepository.deactivateCategory(id);
  }

  findMovements() {
    return this.inventoryRepository.findMovements();
  }

  async findLowStock() {
    const products = await this.inventoryRepository.findLowStock();
    return products.map((product) => this.mapProduct(product));
  }

  async getSummary() {
    const [productsCount, categoriesCount, products] = await this.inventoryRepository.summary();
    const lowStockCount = products.filter((product) => product.stock <= product.minStock).length;
    const inventoryValue = products.reduce(
      (total, product) => total + Number(product.purchasePrice) * product.stock,
      0,
    );

    return {
      productsCount,
      categoriesCount,
      lowStockCount,
      inventoryValue,
    };
  }

  private resolveNewStock(previousStock: number, type: InventoryMovementType, quantity: number) {
    if (type === InventoryMovementType.IN) {
      return previousStock + quantity;
    }

    if (type === InventoryMovementType.OUT) {
      const nextStock = previousStock - quantity;

      if (nextStock < 0) {
        throw new BadRequestException('El stock no puede quedar en negativo');
      }

      return nextStock;
    }

    return quantity;
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.inventoryRepository.findCategoryById(categoryId);

    if (!category || !category.isActive) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }

  private async ensureUniqueCategory(name: string) {
    const category = await this.inventoryRepository.findCategoryByName(name);

    if (category) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }
  }

  private async ensureUniqueProduct(sku?: string, barcode?: string | null) {
    if (sku) {
      const existingSku = await this.inventoryRepository.findProductBySku(sku);

      if (existingSku) {
        throw new ConflictException('Ya existe un producto con ese SKU');
      }
    }

    if (barcode) {
      const existingBarcode = await this.inventoryRepository.findProductByBarcode(barcode);

      if (existingBarcode) {
        throw new ConflictException('Ya existe un producto con ese codigo de barras');
      }
    }
  }

  private audit(userId: string, action: string, description: string) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'inventory',
        description,
      },
    });
  }

  private mapProduct<TProduct extends { purchasePrice: unknown; salePrice: unknown }>(product: TProduct) {
    return {
      ...product,
      purchasePrice: Number(product.purchasePrice),
      salePrice: Number(product.salePrice),
    };
  }

  private normalizeProductPayload<T extends Partial<CreateProductDto>>(dto: T) {
    const payload: any = { ...dto };
    const textFields = ['name', 'description', 'sku', 'barcode', 'brand', 'model', 'warranty', 'recommendedUse', 'salesNotes', 'unit'] as const;

    textFields.forEach((field) => {
      if (typeof payload[field] === 'string') {
        const clean = this.cleanText(payload[field]);
        payload[field] = clean || undefined;
      }
    });

    if ('technicalSpecs' in payload) {
      payload.technicalSpecs = this.sanitizeTechnicalSpecs(payload.technicalSpecs);
    }

    payload.technicalSpecsSearch = this.buildTechnicalSpecsSearch(payload);
    return payload as T & { technicalSpecsSearch?: string | null };
  }

  private sanitizeTechnicalSpecs(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
    const sanitized: Record<string, string | Record<string, string>> = {};

    for (const [rawKey, rawValue] of Object.entries(value as Record<string, unknown>).slice(0, 10)) {
      const key = this.cleanText(rawKey);
      if (!key || rawValue === undefined || rawValue === null) continue;

      if (typeof rawValue === 'object' && !Array.isArray(rawValue)) {
        const groupEntries = Object.entries(rawValue as Record<string, unknown>)
          .map(([groupKey, groupValue]) => [this.cleanText(groupKey), this.cleanText(String(groupValue ?? ''))])
          .filter(([groupKey, groupValue]) => groupKey && groupValue)
          .slice(0, 12);

        if (groupEntries.length) {
          sanitized[key] = Object.fromEntries(groupEntries);
        }
        continue;
      }

      const textValue = this.cleanText(String(rawValue));
      if (textValue) sanitized[key] = textValue;
    }

    return Object.keys(sanitized).length ? sanitized : undefined;
  }

  private cleanText(value: string) {
    return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private buildTechnicalSpecsSearch(payload: Record<string, unknown>) {
    const specs = this.flattenTechnicalSpecsForSearch(payload.technicalSpecs);
    return [
      payload.brand,
      payload.model,
      payload.warranty,
      payload.recommendedUse,
      payload.salesNotes,
      ...specs,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase() || null;
  }

  private flattenTechnicalSpecsForSearch(value: unknown): string[] {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];

    return Object.entries(value as Record<string, unknown>).flatMap(([key, rawValue]) => {
      if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
        return [key, ...this.flattenTechnicalSpecsForSearch(rawValue)];
      }

      return [key, String(rawValue ?? '')];
    });
  }
}
