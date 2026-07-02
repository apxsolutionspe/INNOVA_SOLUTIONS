import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CashReportQueryDto } from './dto/cash-report-query.dto';
import { ExportReportQueryDto } from './dto/export-report-query.dto';
import { InventoryReportQueryDto } from './dto/inventory-report-query.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { ReportsService } from './reports.service';

@ApiBearerAuth()
@ApiTags('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  summary(@Query() query: ReportQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.summary(query, user);
  }

  @Get('sales')
  sales(@Query() query: SalesReportQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.sales(query, user);
  }

  @Get('inventory')
  inventory(@Query() query: InventoryReportQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.inventory(query, user);
  }

  @Get('service-orders')
  serviceOrders(@Query() query: ReportQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.serviceOrders(query, user);
  }

  @Get('quick-services')
  quickServices(@Query() query: ReportQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.quickServices(query, user);
  }

  @Get('purchases')
  purchases(@Query() query: ReportQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.purchases(query, user);
  }

  @Get('cash')
  cash(@Query() query: CashReportQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.cash(query, user);
  }

  @Get('profitability-basic')
  profitability(@Query() query: ReportQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reportsService.profitabilityBasic(query, user);
  }

  @Get('export/sales/pdf')
  @Header('Content-Type', 'application/pdf')
  async exportSalesPdf(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportSales(query, user, 'pdf');
    this.sendFile(res, buffer, 'reporte-ventas.pdf', 'application/pdf');
  }

  @Get('export/sales/excel')
  async exportSalesExcel(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportSales(query, user, 'excel');
    this.sendFile(res, buffer, 'reporte-ventas.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  @Get('export/inventory/pdf')
  async exportInventoryPdf(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportInventory(query, user, 'pdf');
    this.sendFile(res, buffer, 'reporte-inventario.pdf', 'application/pdf');
  }

  @Get('export/inventory/excel')
  async exportInventoryExcel(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportInventory(query, user, 'excel');
    this.sendFile(res, buffer, 'reporte-inventario.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  @Get('export/cash/pdf')
  async exportCashPdf(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportCash(query, user, 'pdf');
    this.sendFile(res, buffer, 'reporte-caja.pdf', 'application/pdf');
  }

  @Get('export/cash/excel')
  async exportCashExcel(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportCash(query, user, 'excel');
    this.sendFile(res, buffer, 'reporte-caja.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  private sendFile(res: Response, buffer: Buffer, filename: string, contentType: string) {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
