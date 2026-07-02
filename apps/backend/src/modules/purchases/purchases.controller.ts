import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CancelPurchaseOrderDto } from './dto/cancel-purchase-order.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseQueryDto } from './dto/purchase-query.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchasesService } from './purchases.service';

@ApiBearerAuth()
@ApiTags('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: PurchaseQueryDto) {
    return this.purchasesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.update(id, dto, user);
  }

  @Roles('ADMIN')
  @Post(':id/receive')
  receive(@Param('id') id: string, @Body() dto: ReceivePurchaseOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.receive(id, dto, user);
  }

  @Roles('ADMIN')
  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelPurchaseOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.cancel(id, dto, user);
  }

  @Get(':id/receipt')
  receipt(@Param('id') id: string) {
    return this.purchasesService.receipt(id);
  }
}
