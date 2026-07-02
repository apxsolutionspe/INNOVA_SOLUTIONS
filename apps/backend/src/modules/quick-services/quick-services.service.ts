import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CashMovementType, CashSessionStatus, PaymentMethod, QuickServiceSaleStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateQuickServiceCategoryDto } from './dto/create-quick-service-category.dto';
import { CreateQuickServiceDto } from './dto/create-quick-service.dto';
import { CreateQuickServiceSaleDto } from './dto/create-quick-service-sale.dto';
import { QuickServiceQueryDto } from './dto/quick-service-query.dto';
import { UpdateQuickServiceCategoryDto } from './dto/update-quick-service-category.dto';
import { UpdateQuickServiceDto } from './dto/update-quick-service.dto';
import { QuickServicesRepository } from './quick-services.repository';

@Injectable()
export class QuickServicesService {
  constructor(private readonly prisma: PrismaService, private readonly repository: QuickServicesRepository) {}

  categories() { return this.repository.categories(); }
  services(query: QuickServiceQueryDto) { return this.repository.services(query).then((items) => items.map((i) => this.repository.mapService(i))); }
  async service(id: string) { const service = await this.repository.service(id); if (!service) throw new NotFoundException('Servicio no encontrado'); return this.repository.mapService(service); }

  createCategory(dto: CreateQuickServiceCategoryDto) { return this.prisma.quickServiceCategory.create({ data: dto }); }
  updateCategory(id: string, dto: UpdateQuickServiceCategoryDto) { return this.prisma.quickServiceCategory.update({ where: { id }, data: dto }); }
  deactivateCategory(id: string) { return this.prisma.quickServiceCategory.update({ where: { id }, data: { isActive: false } }); }
  async createService(dto: CreateQuickServiceDto) { await this.ensureCategory(dto.categoryId); return this.prisma.quickService.create({ data: dto, include: { category: true } }).then((s) => this.repository.mapService(s)); }
  async updateService(id: string, dto: UpdateQuickServiceDto) { if (dto.categoryId) await this.ensureCategory(dto.categoryId); return this.prisma.quickService.update({ where: { id }, data: dto, include: { category: true } }).then((s) => this.repository.mapService(s)); }
  deactivateService(id: string) { return this.prisma.quickService.update({ where: { id }, data: { isActive: false }, include: { category: true } }).then((s) => this.repository.mapService(s)); }

  sales() { return this.repository.sales().then((sales) => sales.map((sale) => this.repository.mapSale(sale))); }
  async sale(id: string) { const sale = await this.repository.sale(id); if (!sale) throw new NotFoundException('Operacion no encontrada'); return this.repository.mapSale(sale); }

  async createSale(dto: CreateQuickServiceSaleDto, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const cashSession = await tx.cashSession.findFirst({ where: { userId: user.id, status: CashSessionStatus.OPEN } });
      if (!cashSession) throw new BadRequestException('Debe abrir caja antes de registrar servicios rapidos');
      if (dto.customerId) {
        const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
        if (!customer || !customer.isActive) throw new BadRequestException('Cliente no disponible');
      }
      const items = [];
      for (const item of dto.items) {
        if (!item.quickServiceId) throw new BadRequestException('Servicio requerido');
        const service = await tx.quickService.findUnique({ where: { id: item.quickServiceId } });
        if (!service || !service.isActive) throw new BadRequestException('Servicio no disponible');
        const unitPrice = Number(service.unitPrice);
        items.push({ quickServiceId: service.id, description: item.description || service.name, quantity: item.quantity, unitPrice, subtotal: unitPrice * item.quantity });
      }
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const discount = dto.discount ?? 0;
      const total = Math.max(subtotal - discount, 0);
      const code = `SR-${String((await tx.quickServiceSale.count()) + 1).padStart(6, '0')}`;
      const sale = await tx.quickServiceSale.create({
        data: { code, customerId: dto.customerId, userId: user.id, cashSessionId: cashSession.id, subtotal, discount, total, paymentMethod: dto.paymentMethod, paymentReference: dto.paymentReference, notes: dto.notes, items: { create: items } },
        include: this.repository.saleInclude(),
      });
      await tx.cashMovement.create({ data: { cashSessionId: cashSession.id, userId: user.id, type: CashMovementType.SERVICE_PAYMENT, concept: `Servicio rapido ${code}`, amount: total, paymentMethod: dto.paymentMethod, reference: dto.paymentReference, relatedQuickServiceSaleId: sale.id } });
      await tx.auditLog.create({ data: { userId: user.id, action: 'CREATE_QUICK_SERVICE_SALE', module: 'quick-services', description: `Servicio rapido registrado: ${code}` } });
      return this.repository.mapSale(sale);
    });
  }

  async cancelSale(id: string, reason: string, user: AuthenticatedUser) {
    if (user.role.name !== 'ADMIN') throw new ForbiddenException('Solo ADMIN puede cancelar operaciones');
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.quickServiceSale.findUnique({ where: { id }, include: this.repository.saleInclude() });
      if (!sale) throw new NotFoundException('Operacion no encontrada');
      if (sale.status === QuickServiceSaleStatus.CANCELLED) throw new BadRequestException('La operacion ya fue cancelada');
      const updated = await tx.quickServiceSale.update({ where: { id }, data: { status: QuickServiceSaleStatus.CANCELLED }, include: this.repository.saleInclude() });
      await tx.cashMovement.create({ data: { cashSessionId: sale.cashSessionId, userId: user.id, type: CashMovementType.ADJUSTMENT, concept: `Cancelacion servicio rapido ${sale.code}`, amount: -Math.abs(Number(sale.total)), paymentMethod: sale.paymentMethod, relatedQuickServiceSaleId: sale.id, notes: reason } });
      await tx.auditLog.create({ data: { userId: user.id, action: 'CANCEL_QUICK_SERVICE_SALE', module: 'quick-services', description: `${sale.code}: ${reason}` } });
      return this.repository.mapSale(updated);
    });
  }

  async receipt(id: string) {
    const sale = await this.sale(id);
    const customer = sale.customer?.fullName ?? 'Cliente general';
    const rows = sale.items.map((item: any) => `<tr><td>${item.description}</td><td>${item.quantity}</td><td>S/ ${item.unitPrice.toFixed(2)}</td><td>S/ ${item.subtotal.toFixed(2)}</td></tr>`).join('');
    return { sale, html: `<!doctype html><html><body><h1>Innova Solutions</h1><p><strong>Operacion:</strong> ${sale.code}</p><p><strong>Cliente:</strong> ${customer}</p><p><strong>Atendido por:</strong> ${sale.user.fullName}</p><table>${rows}</table><p>Descuento: S/ ${sale.discount.toFixed(2)}</p><h2>Total: S/ ${sale.total.toFixed(2)}</h2><p>Metodo: ${sale.paymentMethod}</p><p>Gracias por confiar en Innova Solutions</p></body></html>` };
  }

  private async ensureCategory(id: string) { const category = await this.prisma.quickServiceCategory.findUnique({ where: { id } }); if (!category || !category.isActive) throw new BadRequestException('Categoria no disponible'); }
}
