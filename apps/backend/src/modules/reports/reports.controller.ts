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

  @Get('export/service-orders/pdf')
  async exportServiceOrdersPdf(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportServiceOrders(query, user, 'pdf');
    this.sendFile(res, buffer, 'reporte-servicios-tecnicos.pdf', 'application/pdf');
  }

  @Get('export/service-orders/excel')
  async exportServiceOrdersExcel(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportServiceOrders(query, user, 'excel');
    this.sendFile(res, buffer, 'reporte-servicios-tecnicos.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  @Get('export/quick-services/pdf')
  async exportQuickServicesPdf(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportQuickServices(query, user, 'pdf');
    this.sendFile(res, buffer, 'reporte-servicios-rapidos.pdf', 'application/pdf');
  }

  @Get('export/quick-services/excel')
  async exportQuickServicesExcel(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportQuickServices(query, user, 'excel');
    this.sendFile(res, buffer, 'reporte-servicios-rapidos.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  @Get('export/purchases/pdf')
  async exportPurchasesPdf(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportPurchases(query, user, 'pdf');
    this.sendFile(res, buffer, 'reporte-compras.pdf', 'application/pdf');
  }

  @Get('export/purchases/excel')
  async exportPurchasesExcel(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportPurchases(query, user, 'excel');
    this.sendFile(res, buffer, 'reporte-compras.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  @Get('export/profitability/pdf')
  async exportProfitabilityPdf(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportProfitability(query, user, 'pdf');
    this.sendFile(res, buffer, 'reporte-rentabilidad.pdf', 'application/pdf');
  }

  @Get('export/profitability/excel')
  async exportProfitabilityExcel(@Query() query: ExportReportQueryDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const buffer = await this.reportsService.exportProfitability(query, user, 'excel');
    this.sendFile(res, buffer, 'reporte-rentabilidad.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  private sendFile(res: Response, buffer: Buffer, filename: string, contentType: string) {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
