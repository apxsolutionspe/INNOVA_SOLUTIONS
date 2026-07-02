import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsService } from './notifications.service';

@ApiBearerAuth()
@ApiTags('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Get() findAll(@Query() query: NotificationQueryDto, @CurrentUser() user: AuthenticatedUser) { return this.service.findAll(query, user); }
  @Get('unread-count') unread(@CurrentUser() user: AuthenticatedUser) { return this.service.unreadCount(user); }
  @Roles('ADMIN') @Post() create(@Body() dto: CreateNotificationDto) { return this.service.create(dto); }
  @Patch(':id/read') read(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.markRead(id, user); }
  @Patch('read-all') readAll(@CurrentUser() user: AuthenticatedUser) { return this.service.readAll(user); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) { return this.service.remove(id, user); }
}
