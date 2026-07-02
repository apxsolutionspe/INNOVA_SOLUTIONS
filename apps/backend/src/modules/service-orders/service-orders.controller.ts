import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddServiceOrderItemDto } from './dto/add-service-order-item.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { ServiceOrderQueryDto } from './dto/service-order-query.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ServiceOrdersService } from './service-orders.service';

@ApiBearerAuth()
@ApiTags('service-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}

  @Post()
  create(@Body() dto: CreateServiceOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.serviceOrdersService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: ServiceOrderQueryDto) {
    return this.serviceOrdersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceOrdersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.serviceOrdersService.update(id, dto, user);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.serviceOrdersService.changeStatus(id, dto, user);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddServiceOrderItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.serviceOrdersService.addItem(id, dto, user);
  }

  @Delete(':id/items/:itemId')
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.serviceOrdersService.removeItem(id, itemId, user);
  }

  @Get(':id/logs')
  logs(@Param('id') id: string) {
    return this.serviceOrdersService.logs(id);
  }

  @Get(':id/receipt')
  receipt(@Param('id') id: string) {
    return this.serviceOrdersService.receipt(id);
  }

  @Post(':id/deliver')
  deliver(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.serviceOrdersService.deliver(id, user);
  }

  @Roles('ADMIN')
  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: AuthenticatedUser) {
    return this.serviceOrdersService.cancel(id, user, reason);
  }
}
