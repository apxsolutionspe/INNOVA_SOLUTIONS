import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma.module';
import { SunatController } from './sunat.controller';
import { SunatService } from './sunat.service';
import { SunatAuthProvider } from './providers/sunat-auth.provider';
import { SunatCpeProvider } from './providers/sunat-cpe.provider';
import { SunatMockProvider } from './providers/sunat-mock.provider';

@Module({ imports: [ConfigModule, PrismaModule], controllers: [SunatController], providers: [SunatService, SunatAuthProvider, SunatCpeProvider, SunatMockProvider] })
export class SunatModule {}
