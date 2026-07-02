import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationPriority, NotificationType } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService, private readonly repository: NotificationsRepository) {}

  async findAll(query: NotificationQueryDto, user: AuthenticatedUser) {
    await this.generateAutomaticNotifications(user);
    return this.repository.findMany(query, user.id, user.role.name === 'ADMIN');
  }

  async unreadCount(user: AuthenticatedUser) {
    await this.generateAutomaticNotifications(user);
    return { count: await this.prisma.notification.count({ where: { isRead: false, OR: [{ userId: user.id }, { userId: null }] } }) };
  }

  create(dto: CreateNotificationDto) {
    return this.repository.create(dto).catch(() => null);
  }

  async markRead(id: string, user: AuthenticatedUser) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notificacion no encontrada');
    if (notification.userId && notification.userId !== user.id && user.role.name !== 'ADMIN') throw new ForbiddenException('No puedes modificar esta notificacion');
    return this.prisma.notification.update({ where: { id }, data: { isRead: true, readAt: new Date() } });
  }

  readAll(user: AuthenticatedUser) {
    return this.prisma.notification.updateMany({ where: { OR: [{ userId: user.id }, { userId: null }] }, data: { isRead: true, readAt: new Date() } });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundException('Notificacion no encontrada');
    if (notification.userId && notification.userId !== user.id && user.role.name !== 'ADMIN') throw new ForbiddenException('No puedes eliminar esta notificacion');
    return this.prisma.notification.delete({ where: { id } });
  }

  private async generateAutomaticNotifications(user: AuthenticatedUser) {
    if (user.role.name !== 'ADMIN') return;
    try {
      const [lowStock, outStock, readyOrders, pendingPurchases] = await Promise.all([
        this.prisma.product.count({ where: { isActive: true, stock: { lte: this.prisma.product.fields.minStock } } }),
        this.prisma.product.count({ where: { isActive: true, stock: { lte: 0 } } }),
        this.prisma.serviceOrder.count({ where: { status: 'READY' } }),
        this.prisma.purchaseOrder.count({ where: { status: { in: ['PENDING', 'PARTIALLY_RECEIVED'] } } }),
      ]);
      const candidates = [
        lowStock ? { title: 'Stock bajo', message: `${lowStock} productos requieren reposicion`, type: NotificationType.STOCK_LOW, priority: NotificationPriority.HIGH, relatedModule: 'inventory' } : null,
        outStock ? { title: 'Productos sin stock', message: `${outStock} productos estan sin stock`, type: NotificationType.STOCK_LOW, priority: NotificationPriority.CRITICAL, relatedModule: 'inventory' } : null,
        readyOrders ? { title: 'Ordenes listas', message: `${readyOrders} ordenes estan listas para entrega`, type: NotificationType.ORDER_READY, priority: NotificationPriority.MEDIUM, relatedModule: 'service-orders' } : null,
        pendingPurchases ? { title: 'Compras pendientes', message: `${pendingPurchases} compras requieren seguimiento`, type: NotificationType.PURCHASE_PENDING, priority: NotificationPriority.MEDIUM, relatedModule: 'purchases' } : null,
      ].filter(Boolean) as CreateNotificationDto[];
      for (const item of candidates) {
        const exists = await this.prisma.notification.findFirst({ where: { title: item.title, isRead: false, relatedModule: item.relatedModule } });
        if (!exists) await this.repository.create(item);
      }
    } catch {
      // Las notificaciones no deben bloquear la operacion principal.
    }
  }
}
