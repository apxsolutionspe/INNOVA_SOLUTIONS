import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { PublicReceiptsController } from './public-receipts.controller';
import { PublicReceiptsService } from './public-receipts.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicReceiptsController],
  providers: [PublicReceiptsService],
})
export class PublicReceiptsModule {}
