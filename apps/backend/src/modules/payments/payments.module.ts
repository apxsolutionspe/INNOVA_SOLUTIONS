import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CulqiProvider } from './providers/culqi.provider';
import { IzipayProvider } from './providers/izipay.provider';

@Module({ imports: [ConfigModule, PrismaModule], controllers: [PaymentsController], providers: [PaymentsService, CulqiProvider, IzipayProvider] })
export class PaymentsModule {}
