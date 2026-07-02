import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({ imports: [PrismaModule], controllers: [SettingsController], providers: [SettingsService] })
export class SettingsModule {}
