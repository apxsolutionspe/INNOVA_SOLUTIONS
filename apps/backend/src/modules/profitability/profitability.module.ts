import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { ProfitabilityController } from './profitability.controller';
import { ProfitabilityRepository } from './profitability.repository';
import { ProfitabilityService } from './profitability.service';

@Module({ imports: [PrismaModule], controllers: [ProfitabilityController], providers: [ProfitabilityService, ProfitabilityRepository] })
export class ProfitabilityModule {}
