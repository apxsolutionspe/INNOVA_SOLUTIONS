import { Module } from '@nestjs/common';
import { QuickServicesController } from './quick-services.controller';
import { QuickServicesRepository } from './quick-services.repository';
import { QuickServicesService } from './quick-services.service';

@Module({
  controllers: [QuickServicesController],
  providers: [QuickServicesService, QuickServicesRepository],
})
export class QuickServicesModule {}
