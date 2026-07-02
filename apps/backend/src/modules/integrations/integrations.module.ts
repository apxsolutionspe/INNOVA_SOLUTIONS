import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsRepository } from './integrations.repository';
import { AiIntegrationProvider } from './providers/ai-integration.provider';
import { CulqiIntegrationProvider } from './providers/culqi-integration.provider';
import { IzipayIntegrationProvider } from './providers/izipay-integration.provider';
import { SunatIntegrationProvider } from './providers/sunat-integration.provider';
import { WhatsappIntegrationProvider } from './providers/whatsapp-integration.provider';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, IntegrationsRepository, SunatIntegrationProvider, WhatsappIntegrationProvider, CulqiIntegrationProvider, IzipayIntegrationProvider, AiIntegrationProvider],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
