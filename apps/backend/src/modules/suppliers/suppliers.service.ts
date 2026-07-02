import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
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
    await this.ensureUniqueRuc(dto.ruc);
    const supplier = await this.suppliersRepository.create(dto);
    await this.audit(user.id, 'CREATE_SUPPLIER', `Proveedor creado: ${supplier.name}`);
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto, user: AuthenticatedUser) {
    const current = await this.findOne(id);
    if (dto.ruc && dto.ruc !== current.ruc) await this.ensureUniqueRuc(dto.ruc);
    const supplier = await this.suppliersRepository.update(id, dto);
    await this.audit(user.id, 'UPDATE_SUPPLIER', `Proveedor editado: ${supplier.name}`);
    return supplier;
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
    if (existing) throw new ConflictException('Ya existe un proveedor con ese RUC');
  }

  private audit(userId: string, action: string, description: string) {
    return this.prisma.auditLog.create({ data: { userId, action, module: 'suppliers', description } });
  }
}
