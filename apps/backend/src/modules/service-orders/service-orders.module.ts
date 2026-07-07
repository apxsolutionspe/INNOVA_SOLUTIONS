import { Module } from '@nestjs/common';

import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { ServiceOrderPdfService } from './pdf/service-order-pdf.service';
import { ServiceOrdersController } from './service-orders.controller';
import { ServiceOrdersRepository } from './service-orders.repository';
import { ServiceOrdersService } from './service-orders.service';

@Module({
  imports: [WhatsappModule],
  controllers: [ServiceOrdersController],
  providers: [ServiceOrdersService, ServiceOrdersRepository, ServiceOrderPdfService],
})
export class ServiceOrdersModule {}
