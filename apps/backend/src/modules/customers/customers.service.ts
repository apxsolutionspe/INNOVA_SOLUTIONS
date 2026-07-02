import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CustomerType, DocumentType } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

type CustomerInput = Partial<{
  customerType: CustomerType;
  documentType: DocumentType;
  documentNumber: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  tradeName: string | null;
  legalRepresentative: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  businessLine: string | null;
  notes: string | null;
  isActive: boolean | null;
}>;

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly prisma: PrismaService,
  ) {}

  findAll(query: CustomerQueryDto) {
    return this.customersRepository.findMany(query);
  }

  async findOne(id: string) {
    const customer = await this.customersRepository.findById(id);

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return customer;
  }

  async create(dto: CreateCustomerDto, user: AuthenticatedUser) {
    const data = this.normalizePayload(dto);
    await this.ensureUniqueDocument(data.documentType, data.documentNumber);

    const customer = await this.customersRepository.create(data);
    await this.audit(user.id, 'CREATE_CUSTOMER', `Cliente creado: ${customer.fullName}`);
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto, user: AuthenticatedUser) {
    const current = await this.findOne(id);

    const data = this.normalizePayload({
      ...current,
      ...dto,
      customerType: dto.customerType ?? current.customerType,
      documentType: dto.documentType ?? current.documentType,
      documentNumber: dto.documentNumber ?? current.documentNumber,
    });

    if (
      data.documentType &&
      data.documentNumber &&
      (data.documentType !== current.documentType ||
        data.documentNumber !== current.documentNumber)
    ) {
      await this.ensureUniqueDocument(data.documentType, data.documentNumber);
    }

    const customer = await this.customersRepository.update(id, data);
    await this.audit(user.id, 'UPDATE_CUSTOMER', `Cliente editado: ${customer.fullName}`);
    return customer;
  }

  async deactivate(id: string, user: AuthenticatedUser) {
    const current = await this.findOne(id);
    const customer = await this.customersRepository.deactivate(current.id);
    await this.audit(user.id, 'DEACTIVATE_CUSTOMER', `Cliente desactivado: ${customer.fullName}`);
    return customer;
  }

  async setStatus(id: string, isActive: boolean, user: AuthenticatedUser) {
    const current = await this.findOne(id);
    const customer = await this.customersRepository.setStatus(current.id, isActive);
    await this.audit(user.id, isActive ? 'ACTIVATE_CUSTOMER' : 'DEACTIVATE_CUSTOMER', `${isActive ? 'Cliente activado' : 'Cliente desactivado'}: ${customer.fullName}`);
    return customer;
  }

  private async ensureUniqueDocument(documentType: CreateCustomerDto['documentType'], documentNumber: string) {
    const existing = await this.customersRepository.findByDocument(documentType, documentNumber);

    if (existing) {
      throw new ConflictException('Ya existe un cliente con ese documento');
    }
  }

  private normalizePayload(dto: CustomerInput) {
    const customerType = dto.customerType ?? CustomerType.NATURAL;
    const documentType = customerType === CustomerType.COMPANY ? DocumentType.RUC : dto.documentType;
    const documentNumber = dto.documentNumber?.trim();

    if (!documentNumber) {
      throw new BadRequestException('El numero de documento es obligatorio');
    }

    if (customerType === CustomerType.COMPANY && documentNumber.length !== 11) {
      throw new BadRequestException('El RUC debe tener 11 digitos');
    }

    const firstName = dto.firstName?.trim();
    const lastName = dto.lastName?.trim();
    const businessName = dto.businessName?.trim();
    const fullName = customerType === CustomerType.COMPANY
      ? businessName
      : [firstName, lastName].filter(Boolean).join(' ').trim() || dto.fullName?.trim();

    if (!fullName) {
      throw new BadRequestException(customerType === CustomerType.COMPANY ? 'La razon social es obligatoria' : 'El nombre del cliente es obligatorio');
    }

    return {
      customerType,
      documentType: documentType ?? DocumentType.DNI,
      documentNumber,
      fullName,
      firstName: customerType === CustomerType.NATURAL ? firstName : undefined,
      lastName: customerType === CustomerType.NATURAL ? lastName : undefined,
      businessName: customerType === CustomerType.COMPANY ? businessName : undefined,
      tradeName: dto.tradeName?.trim() || undefined,
      legalRepresentative: dto.legalRepresentative?.trim() || undefined,
      phone: dto.phone?.trim() || undefined,
      email: dto.email?.trim() || undefined,
      address: dto.address?.trim() || undefined,
      businessLine: dto.businessLine?.trim() || undefined,
      notes: dto.notes?.trim() || undefined,
      isActive: dto.isActive ?? true,
    };
  }

  private audit(userId: string, action: string, description: string) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        module: 'customers',
        description,
      },
    });
  }
}
