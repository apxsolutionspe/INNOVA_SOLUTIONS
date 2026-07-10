import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { SupplierProductDto } from './dto/supplier-product.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersRepository } from './suppliers.repository';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly suppliersRepository: SuppliersRepository,
    private readonly prisma: PrismaService,
  ) {}

  findAll(query: SupplierQueryDto) {
    return this.suppliersRepository.findMany(query);
  }

  async findOne(id: string) {
    const supplier = await this.suppliersRepository.findById(id);
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    return supplier;
  }

  async create(dto: CreateSupplierDto, user: AuthenticatedUser) {
    const payload = this.normalizeSupplier(dto);
    this.ensureNoDuplicateProducts(payload.products);
    await this.ensureUniqueRuc(payload.ruc);
    const supplier = await this.suppliersRepository.create(payload);
    await this.audit(user.id, 'CREATE_SUPPLIER', `Proveedor creado: ${supplier.name}`);
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto, user: AuthenticatedUser) {
    const current = await this.findOne(id);
    const payload = this.normalizeSupplier(dto);
    this.ensureNoDuplicateProducts(payload.products);
    if (payload.ruc && payload.ruc !== current.ruc) await this.ensureUniqueRuc(payload.ruc);
    const supplier = await this.suppliersRepository.update(id, payload);
    await this.audit(user.id, 'UPDATE_SUPPLIER', `Proveedor editado: ${supplier.name}`);
    return supplier;
  }

  async addProduct(id: string, dto: SupplierProductDto, user: AuthenticatedUser) {
    await this.findOne(id);
    await this.ensureCatalogItemIsUnique(id, dto);
    const supplier = await this.suppliersRepository.addProduct(id, dto);
    await this.audit(user.id, 'ADD_SUPPLIER_PRODUCT', `Producto agregado a proveedor: ${supplier.name}`);
    return supplier;
  }

  async updateProduct(id: string, itemId: string, dto: SupplierProductDto, user: AuthenticatedUser) {
    await this.findOne(id);
    await this.ensureCatalogItemIsUnique(id, dto, itemId);
    const supplier = await this.suppliersRepository.updateProduct(id, itemId, dto);
    await this.audit(user.id, 'UPDATE_SUPPLIER_PRODUCT', `Producto de proveedor actualizado: ${supplier.name}`);
    return supplier;
  }

  async deactivateProduct(id: string, itemId: string, user: AuthenticatedUser) {
    await this.findOne(id);
    const supplier = await this.suppliersRepository.deactivateProduct(id, itemId);
    await this.audit(user.id, 'DEACTIVATE_SUPPLIER_PRODUCT', `Producto de proveedor desactivado: ${supplier.name}`);
    return supplier;
  }

  async findProducts(id: string) {
    const supplier = await this.findOne(id);
    return supplier.products ?? [];
  }

  async deactivate(id: string, user: AuthenticatedUser) {
    const current = await this.findOne(id);
    const supplier = await this.suppliersRepository.deactivate(current.id);
    await this.audit(user.id, 'DEACTIVATE_SUPPLIER', `Proveedor desactivado: ${supplier.name}`);
    return supplier;
  }

  private async ensureUniqueRuc(ruc?: string) {
    if (!ruc) return;
    const existing = await this.suppliersRepository.findByRuc(ruc);
    if (existing) throw new ConflictException('Ya existe un proveedor registrado con este RUC.');
  }

  private ensureNoDuplicateProducts(products?: SupplierProductDto[]) {
    if (!products?.length) return;
    const seenProductIds = new Set<string>();
    const seenNames = new Set<string>();

    products.forEach((product) => {
      if (product.productId) {
        if (seenProductIds.has(product.productId)) {
          throw new BadRequestException('Este producto ya está asignado a este proveedor.');
        }
        seenProductIds.add(product.productId);
        return;
      }

      const key = this.normalizeCatalogName(product.name);
      if (key && seenNames.has(key)) {
        throw new BadRequestException('Este producto ofrecido ya está asignado a este proveedor.');
      }
      if (key) seenNames.add(key);
    });
  }

  private async ensureCatalogItemIsUnique(supplierId: string, dto: SupplierProductDto, ignoredItemId?: string) {
    if (dto.productId) {
      const existing = await this.prisma.supplierProduct.findFirst({
        where: {
          supplierId,
          productId: dto.productId,
          id: ignoredItemId ? { not: ignoredItemId } : undefined,
        },
      });
      if (existing) throw new BadRequestException('Este producto ya está asignado a este proveedor.');
      return;
    }

    const normalizedName = this.normalizeCatalogName(dto.name);
    if (!normalizedName) return;
    const existing = await this.prisma.supplierProduct.findFirst({
      where: {
        supplierId,
        productId: null,
        name: { equals: dto.name, mode: 'insensitive' },
        id: ignoredItemId ? { not: ignoredItemId } : undefined,
      },
    });
    if (existing) throw new BadRequestException('Este producto ofrecido ya está asignado a este proveedor.');
  }

  private normalizeCatalogName(value?: string) {
    return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  private normalizeSupplier<T extends Partial<CreateSupplierDto>>(dto: T): T {
    const normalized = { ...dto };
    if (typeof normalized.ruc === 'string') normalized.ruc = normalized.ruc.replace(/\D/g, '') || undefined;
    if (typeof normalized.phone === 'string') normalized.phone = normalized.phone.replace(/[^\d+]/g, '') || undefined;
    if (typeof normalized.whatsapp === 'string') normalized.whatsapp = normalized.whatsapp.replace(/[^\d+]/g, '') || undefined;
    return normalized;
  }

  private audit(userId: string, action: string, description: string) {
    return this.prisma.auditLog.create({ data: { userId, action, module: 'suppliers', description } });
  }
}
