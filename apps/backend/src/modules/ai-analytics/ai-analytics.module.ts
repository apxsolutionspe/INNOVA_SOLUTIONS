import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { AiAnalyticsController } from './ai-analytics.controller';
import { AiAnalyticsService } from './ai-analytics.service';
import { AiMockProvider } from './providers/ai-mock.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Module({ imports: [ConfigModule, PrismaModule], controllers: [AiAnalyticsController], providers: [AiAnalyticsService, AiMockProvider, OpenAiProvider, GeminiProvider] })
export class AiAnalyticsModule {}
