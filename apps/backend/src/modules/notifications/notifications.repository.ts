import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: NotificationQueryDto, userId: string, isAdmin: boolean) {
    const where: Prisma.NotificationWhereInput = {
      isRead: query.isRead,
      type: query.type,
      priority: query.priority,
      OR: isAdmin ? [{ userId }, { userId: null }] : [{ userId }, { userId: null }],
    };
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.notification.count({ where }),
    ]);
    return { items, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } };
  }

  create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({ data: dto });
  }
}
