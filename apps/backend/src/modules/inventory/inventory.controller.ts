import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InventoryService } from './inventory.service';

@ApiBearerAuth()
@ApiTags('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  findProducts(@Query() query: ProductQueryDto) {
    return this.inventoryService.findProducts(query);
  }

  @Get('products/:id')
  findProduct(@Param('id') id: string) {
    return this.inventoryService.findProduct(id);
  }

  @Roles('ADMIN')
  @Post('products')
  createProduct(@Body() dto: CreateProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.createProduct(dto, user);
  }

  @Roles('ADMIN')
  @Patch('products/:id')
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventoryService.updateProduct(id, dto, user);
  }

  @Roles('ADMIN')
  @Delete('products/:id')
  deactivateProduct(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.inventoryService.deactivateProduct(id, user);
  }

  @Roles('ADMIN')
  @Post('products/:id/adjust-stock')
  adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.inventoryService.adjustStock(id, dto, user);
  }

  @Get('categories')
  findCategories() {
    return this.inventoryService.findCategories();
  }

  @Roles('ADMIN')
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.inventoryService.createCategory(dto);
  }

  @Roles('ADMIN')
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.inventoryService.updateCategory(id, dto);
  }

  @Roles('ADMIN')
  @Delete('categories/:id')
  deactivateCategory(@Param('id') id: string) {
    return this.inventoryService.deactivateCategory(id);
  }

  @Get('movements')
  findMovements() {
    return this.inventoryService.findMovements();
  }

  @Get('low-stock')
  findLowStock() {
    return this.inventoryService.findLowStock();
  }
}
