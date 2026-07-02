import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { EcommerceController } from './ecommerce.controller';
import { EcommerceService } from './ecommerce.service';

@Module({ imports: [PrismaModule], controllers: [EcommerceController], providers: [EcommerceService] })
export class EcommerceModule {}
