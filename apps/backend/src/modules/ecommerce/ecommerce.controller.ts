import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOnlineOrderDto } from './dto/create-online-order.dto';
import { EcommerceProductQueryDto } from './dto/ecommerce-product-query.dto';
import { UpdateOnlineOrderStatusDto } from './dto/update-online-order-status.dto';
import { EcommerceService } from './ecommerce.service';

@ApiBearerAuth()
@ApiTags('ecommerce')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ecommerce')
export class EcommerceController {
  constructor(private readonly service: EcommerceService) {}
  @Get('products') products(@Query() query: EcommerceProductQueryDto) { return this.service.products(query); }
  @Get('products/:id') product(@Param('id') id: string) { return this.service.product(id); }
  @Post('orders') createOrder(@Body() dto: CreateOnlineOrderDto) { return this.service.createOrder(dto); }
  @Roles('ADMIN') @Get('orders') orders() { return this.service.orders(); }
  @Roles('ADMIN') @Get('orders/:id') order(@Param('id') id: string) { return this.service.order(id); }
  @Roles('ADMIN') @Patch('orders/:id/status') status(@Param('id') id: string, @Body() body: UpdateOnlineOrderStatusDto) { return this.service.updateStatus(id, body.status); }
}
