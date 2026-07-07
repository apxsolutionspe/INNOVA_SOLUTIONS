import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { PublicReceiptsService } from './public-receipts.service';

@ApiTags('public-receipts')
@Controller('public/receipts')
export class PublicReceiptsController {
  constructor(private readonly service: PublicReceiptsService) {}

  @Get('sales/:id')
  async sale(@Param('id') id: string, @Res() response: Response) {
    response.type('html').send(await this.service.saleReceipt(id));
  }

  @Get('sales/:id/pdf')
  async salePdf(@Param('id') id: string, @Res() response: Response) {
    const receipt = await this.service.saleReceiptPdf(id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename="${receipt.filename}"`);
    response.send(receipt.buffer);
  }

  @Get('quick-services/:id')
  async quickService(@Param('id') id: string, @Res() response: Response) {
    response.type('html').send(await this.service.quickServiceReceipt(id));
  }

  @Get('quick-services/:id/pdf')
  async quickServicePdf(@Param('id') id: string, @Res() response: Response) {
    const receipt = await this.service.quickServiceReceiptPdf(id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename="${receipt.filename}"`);
    response.send(receipt.buffer);
  }

  @Get('service-orders/:id')
  async serviceOrder(@Param('id') id: string, @Res() response: Response) {
    response.type('html').send(await this.service.serviceOrderReceipt(id));
  }

  @Get('service-orders/:id/pdf')
  async serviceOrderPdf(@Param('id') id: string, @Res() response: Response) {
    const receipt = await this.service.serviceOrderReceiptPdf(id);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `inline; filename="${receipt.filename}"`);
    response.send(receipt.buffer);
  }
}
