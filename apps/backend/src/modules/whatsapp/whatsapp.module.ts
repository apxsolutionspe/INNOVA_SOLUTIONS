import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { SalesModule } from '../sales/sales.module';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappCloudProvider } from './providers/whatsapp-cloud.provider';
import { WhatsappMockProvider } from './providers/whatsapp-mock.provider';

@Module({
  imports: [ConfigModule, PrismaModule, SalesModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappCloudProvider, WhatsappMockProvider],
  exports: [WhatsappService],
})
export class WhatsappModule {}
