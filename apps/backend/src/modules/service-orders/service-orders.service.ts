import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InventoryMovementType, Prisma, ServiceOrderStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { AddServiceOrderPhotosDto } from './dto/add-service-order-photos.dto';
import { AddServiceOrderItemDto } from './dto/add-service-order-item.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { ServiceOrderPhotoDto } from './dto/service-order-photo.dto';
import { ServiceOrderQueryDto } from './dto/service-order-query.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ServiceOrderPdfService } from './pdf/service-order-pdf.service';
import { ServiceOrdersRepository } from './service-orders.repository';

const allowedTransitions: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
  RECEIVED: [ServiceOrderStatus.DIAGNOSIS, ServiceOrderStatus.CANCELLED],
  DIAGNOSIS: [ServiceOrderStatus.IN_PROGRESS, ServiceOrderStatus.CANCELLED],
  IN_PROGRESS: [ServiceOrderStatus.READY, ServiceOrderStatus.CANCELLED],
  READY: [ServiceOrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repository: ServiceOrdersRepository,
    private readonly receiptService: ServiceOrderPdfService,
    private readonly whatsappService: WhatsappService,
  ) {}

  findAll(query: ServiceOrderQueryDto) {
    return this.repository.findMany(query);
  }

  async findOne(id: string) {
    const order = await this.repository.findById(id);
    if (!order) throw new NotFoundException('Orden tecnica no encontrada');
    return this.repository.mapOrder(order);
  }

  async create(dto: CreateServiceOrderDto, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const { photos = [], ...orderData } = dto;
      const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
      if (!customer || !customer.isActive) throw new BadRequestException('Cliente no disponible');
      const normalizedPhotos = this.normalizePhotos(photos);
      const code = await this.generateCode(tx);
      const order = await tx.serviceOrder.create({
        data: {
          ...orderData,
          estimatedDeliveryDate: dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : undefined,
          code,
          userId: user.id,
          total: 0,
          photos: normalizedPhotos.length ? { create: normalizedPhotos } : undefined,
          logs: { create: { userId: user.id, action: 'CREATE_ORDER', newStatus: ServiceOrderStatus.RECEIVED, comment: 'Orden recibida' } },
        },
        include: this.repository.include(),
      });
      await this.audit(tx, user.id, 'CREATE_SERVICE_ORDER', `Orden creada: ${code}`);
      return this.repository.mapOrder(order);
    });
  }

  async update(id: string, dto: UpdateServiceOrderDto, user: AuthenticatedUser) {
    const current = await this.ensureEditable(id);
    if ((dto.laborCost !== undefined || dto.discount !== undefined) && user.role.name !== 'ADMIN') {
      throw new ForbiddenException('Solo ADMIN puede modificar costos finales');
    }
    const laborCost = dto.laborCost ?? Number(current.laborCost);
    const discount = dto.discount ?? Number(current.discount);
    const total = this.calculateTotal(laborCost, Number(current.partsCost), discount);
    const order = await this.prisma.serviceOrder.update({
      where: { id },
      data: {
        ...dto,
        estimatedDeliveryDate: dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : undefined,
        total,
      },
      include: this.repository.include(),
    });
    await this.prisma.serviceOrderLog.create({
      data: { serviceOrderId: id, userId: user.id, action: 'UPDATE_ORDER', comment: dto.technicalDiagnosis ? 'Diagnostico registrado' : 'Orden actualizada' },
    });
    await this.audit(this.prisma, user.id, 'UPDATE_SERVICE_ORDER', `Orden actualizada: ${order.code}`);
    return this.repository.mapOrder(order);
  }

  async changeStatus(id: string, dto: ChangeStatusDto, user: AuthenticatedUser) {
    const current = await this.ensureEditable(id);
    this.ensureTransition(current.status, dto.status);
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.serviceOrder.update({
        where: { id },
        data: { status: dto.status },
        include: this.repository.include(),
      });
      await tx.serviceOrderLog.create({
        data: { serviceOrderId: id, userId: user.id, previousStatus: current.status, newStatus: dto.status, action: 'CHANGE_STATUS', comment: dto.comment },
      });
      await this.audit(tx, user.id, 'CHANGE_SERVICE_ORDER_STATUS', `${order.code}: ${current.status} -> ${dto.status}`);
      return this.repository.mapOrder(order);
    });
  }

  async addItem(id: string, dto: AddServiceOrderItemDto, user: AuthenticatedUser) {
    const current = await this.ensureEditable(id);
    return this.prisma.$transaction(async (tx) => {
      let unitPrice = dto.unitPrice;
      let description = dto.description;
      if (dto.productId) {
        const product = await tx.product.findUnique({ where: { id: dto.productId } });
        if (!product || !product.isActive) throw new BadRequestException('Producto no disponible');
        if (product.stock < dto.quantity) throw new BadRequestException('Stock insuficiente para repuesto');
        unitPrice = Number(product.salePrice);
        description = dto.description || product.name;
        const newStock = product.stock - dto.quantity;
        await tx.product.update({ where: { id: product.id }, data: { stock: newStock } });
        await tx.inventoryMovement.create({
          data: { productId: product.id, type: InventoryMovementType.OUT, quantity: dto.quantity, previousStock: product.stock, newStock, reason: `Repuesto en orden ${current.code}`, userId: user.id },
        });
      }
      const subtotal = unitPrice * dto.quantity;
      await tx.serviceOrderItem.create({ data: { serviceOrderId: id, productId: dto.productId, description, quantity: dto.quantity, unitPrice, subtotal } });
      const partsCost = Number(current.partsCost) + subtotal;
      const total = this.calculateTotal(Number(current.laborCost), partsCost, Number(current.discount));
      const order = await tx.serviceOrder.update({ where: { id }, data: { partsCost, total }, include: this.repository.include() });
      await tx.serviceOrderLog.create({ data: { serviceOrderId: id, userId: user.id, action: 'ADD_ITEM', comment: `Item agregado: ${description}` } });
      await this.audit(tx, user.id, 'ADD_SERVICE_ORDER_ITEM', `Item agregado a ${order.code}`);
      return this.repository.mapOrder(order);
    });
  }

  async removeItem(id: string, itemId: string, user: AuthenticatedUser) {
    const current = await this.ensureEditable(id);
    const item = await this.prisma.serviceOrderItem.findUnique({ where: { id: itemId } });
    if (!item || item.serviceOrderId !== id) throw new NotFoundException('Item no encontrado');
    const partsCost = Math.max(Number(current.partsCost) - Number(item.subtotal), 0);
    const total = this.calculateTotal(Number(current.laborCost), partsCost, Number(current.discount));
    await this.prisma.serviceOrderItem.delete({ where: { id: itemId } });
    const order = await this.prisma.serviceOrder.update({ where: { id }, data: { partsCost, total }, include: this.repository.include() });
    await this.prisma.serviceOrderLog.create({ data: { serviceOrderId: id, userId: user.id, action: 'REMOVE_ITEM', comment: `Item retirado: ${item.description}` } });
    return this.repository.mapOrder(order);
  }

  async addPhotos(id: string, dto: AddServiceOrderPhotosDto, user: AuthenticatedUser) {
    await this.ensureEditable(id);
    return this.prisma.$transaction(async (tx) => {
      const currentPhotos = await tx.serviceOrderPhoto.count({ where: { serviceOrderId: id } });
      if (currentPhotos + dto.photos.length > 6) {
        throw new BadRequestException('La orden solo puede tener hasta 6 fotos de evidencia.');
      }

      const normalizedPhotos = this.normalizePhotos(dto.photos);
      await tx.serviceOrderPhoto.createMany({
        data: normalizedPhotos.map((photo) => ({ ...photo, serviceOrderId: id })),
      });
      await tx.serviceOrderLog.create({
        data: {
          serviceOrderId: id,
          userId: user.id,
          action: 'ADD_PHOTOS',
          comment: `${normalizedPhotos.length} foto(s) de recepción agregada(s)`,
        },
      });
      await this.audit(tx, user.id, 'ADD_SERVICE_ORDER_PHOTOS', `Fotos agregadas a orden ${id}`);
      const order = await tx.serviceOrder.findUniqueOrThrow({ where: { id }, include: this.repository.include() });
      return this.repository.mapOrder(order);
    });
  }

  async deletePhoto(id: string, photoId: string, user: AuthenticatedUser) {
    await this.ensureEditable(id);
    const photo = await this.prisma.serviceOrderPhoto.findUnique({ where: { id: photoId } });
    if (!photo || photo.serviceOrderId !== id) throw new NotFoundException('Foto no encontrada');
    await this.prisma.serviceOrderPhoto.delete({ where: { id: photoId } });
    await this.prisma.serviceOrderLog.create({
      data: { serviceOrderId: id, userId: user.id, action: 'REMOVE_PHOTO', comment: 'Foto de recepción retirada' },
    });
    await this.audit(this.prisma, user.id, 'REMOVE_SERVICE_ORDER_PHOTO', `Foto retirada de orden ${id}`);
    return this.findOne(id);
  }

  logs(id: string) {
    return this.repository.logs(id);
  }

  async receipt(id: string) {
    const order = await this.findOne(id);
    return { order, html: this.receiptService.buildReceiptHtml(order) };
  }

  ticket(id: string) {
    return this.receipt(id);
  }

  async sendWhatsApp(id: string, user: AuthenticatedUser) {
    const order = await this.findOne(id);
    const phone = order.customer?.phone;
    if (!phone) throw new BadRequestException('El cliente no tiene teléfono registrado.');
    return this.whatsappService.sendReceipt({ type: 'SERVICE_ORDER', id: order.id, phone }, user);
  }

  deliver(id: string, user: AuthenticatedUser) {
    return this.changeStatus(id, { status: ServiceOrderStatus.DELIVERED, comment: 'Equipo entregado' }, user).then(async (order) => {
      const delivered = await this.prisma.serviceOrder.update({ where: { id }, data: { deliveredAt: new Date() }, include: this.repository.include() });
      return this.repository.mapOrder(delivered);
    });
  }

  async cancel(id: string, user: AuthenticatedUser, reason: string) {
    if (user.role.name !== 'ADMIN') throw new ForbiddenException('Solo ADMIN puede cancelar ordenes');
    return this.changeStatus(id, { status: ServiceOrderStatus.CANCELLED, comment: reason }, user);
  }

  private async ensureEditable(id: string) {
    const order = await this.prisma.serviceOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Orden tecnica no encontrada');
    if (
      order.status === ServiceOrderStatus.DELIVERED ||
      order.status === ServiceOrderStatus.CANCELLED
    ) {
      throw new BadRequestException('No se puede modificar una orden finalizada');
    }
    return order;
  }

  private ensureTransition(from: ServiceOrderStatus, to: ServiceOrderStatus) {
    if (!allowedTransitions[from].includes(to)) throw new BadRequestException(`Transicion no permitida: ${from} -> ${to}`);
  }

  private calculateTotal(laborCost: number, partsCost: number, discount: number) {
    return Math.max(laborCost + partsCost - discount, 0);
  }

  private normalizePhotos(photos: ServiceOrderPhotoDto[]) {
    return photos.map((photo) => {
      const mimeType = photo.mimeType;
      if (!/^data:image\/(jpeg|png|webp);base64,/i.test(photo.imageData)) {
        throw new BadRequestException('Cada foto debe enviarse como Data URL válido.');
      }
      if (photo.sizeBytes && photo.sizeBytes > 2 * 1024 * 1024) {
        throw new BadRequestException('Cada foto debe pesar como máximo 2 MB.');
      }
      return {
        imageData: photo.imageData,
        fileName: photo.fileName,
        mimeType,
        sizeBytes: photo.sizeBytes,
        note: photo.note,
      };
    });
  }

  private async generateCode(tx: Prisma.TransactionClient) {
    const count = await tx.serviceOrder.count();
    return `OT-${String(count + 1).padStart(6, '0')}`;
  }

  private audit(tx: Pick<PrismaService, 'auditLog'> | Prisma.TransactionClient, userId: string, action: string, description: string) {
    return tx.auditLog.create({ data: { userId, action, module: 'service-orders', description } });
  }
}
