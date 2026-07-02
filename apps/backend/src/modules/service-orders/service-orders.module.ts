import { Module } from '@nestjs/common';

import { ServiceOrderPdfService } from './pdf/service-order-pdf.service';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersRepository } from './service-orders.repository';
import { ServiceOrdersService } from './service-orders.service';

@Module({
  controllers: [ServiceOrdersController],
  providers: [ServiceOrdersService, ServiceOrdersRepository, ServiceOrderPdfService],
})
export class ServiceOrdersModule {}
