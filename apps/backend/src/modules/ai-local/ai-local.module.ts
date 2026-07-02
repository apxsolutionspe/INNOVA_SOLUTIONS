import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { AiLocalController } from './ai-local.controller';
import { AiLocalService } from './ai-local.service';
import { AiLocalHttpProvider } from './providers/ai-local-http.provider';

@Module({
  imports: [PrismaModule],
  controllers: [AiLocalController],
  providers: [AiLocalService, AiLocalHttpProvider],
})
export class AiLocalModule {}
