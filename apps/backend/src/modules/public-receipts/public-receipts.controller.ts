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

  @Get('quick-services/:id')
  async quickService(@Param('id') id: string, @Res() response: Response) {
    response.type('html').send(await this.service.quickServiceReceipt(id));
  }

  @Get('service-orders/:id')
  async serviceOrder(@Param('id') id: string, @Res() response: Response) {
    response.type('html').send(await this.service.serviceOrderReceipt(id));
  }
}
