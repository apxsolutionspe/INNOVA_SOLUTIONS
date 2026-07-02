import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuickServiceCategoryDto } from './dto/create-quick-service-category.dto';
import { CreateQuickServiceDto } from './dto/create-quick-service.dto';
import { CreateQuickServiceSaleDto } from './dto/create-quick-service-sale.dto';
import { QuickServiceQueryDto } from './dto/quick-service-query.dto';
import { UpdateQuickServiceCategoryDto } from './dto/update-quick-service-category.dto';
import { UpdateQuickServiceDto } from './dto/update-quick-service.dto';
import { QuickServicesService } from './quick-services.service';

@ApiBearerAuth()
@ApiTags('quick-services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class QuickServicesController {
  constructor(private readonly service: QuickServicesService) {}

  @Get('quick-services/categories') categories() { return this.service.categories(); }
  @Roles('ADMIN') @Post('quick-services/categories') createCategory(@Body() dto: CreateQuickServiceCategoryDto) { return this.service.createCategory(dto); }
  @Roles('ADMIN') @Patch('quick-services/categories/:id') updateCategory(@Param('id') id: string, @Body() dto: UpdateQuickServiceCategoryDto) { return this.service.updateCategory(id, dto); }
  @Roles('ADMIN') @Delete('quick-services/categories/:id') deleteCategory(@Param('id') id: string) { return this.service.deactivateCategory(id); }

  @Get('quick-services') services(@Query() query: QuickServiceQueryDto) { return this.service.services(query); }
  @Get('quick-services/:id') serviceById(@Param('id') id: string) { return this.service.service(id); }
  @Roles('ADMIN') @Post('quick-services') createService(@Body() dto: CreateQuickServiceDto) { return this.service.createService(dto); }
  @Roles('ADMIN') @Patch('quick-services/:id') updateService(@Param('id') id: string, @Body() dto: UpdateQuickServiceDto) { return this.service.updateService(id, dto); }
  @Roles('ADMIN') @Delete('quick-services/:id') deleteService(@Param('id') id: string) { return this.service.deactivateService(id); }

  @Post('quick-service-sales') createSale(@Body() dto: CreateQuickServiceSaleDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createSale(dto, user); }
  @Get('quick-service-sales') sales() { return this.service.sales(); }
  @Get('quick-service-sales/:id') sale(@Param('id') id: string) { return this.service.sale(id); }
  @Roles('ADMIN') @Post('quick-service-sales/:id/cancel') cancel(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: AuthenticatedUser) { return this.service.cancelSale(id, reason, user); }
  @Get('quick-service-sales/:id/receipt') receipt(@Param('id') id: string) { return this.service.receipt(id); }
}
