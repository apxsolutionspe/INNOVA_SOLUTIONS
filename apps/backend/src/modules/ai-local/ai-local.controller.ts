import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AiLocalService } from './ai-local.service';
import { AiLocalQueryDto } from './dto/ai-local-query.dto';
import { RebuildIndexDto } from './dto/rebuild-index.dto';

@ApiBearerAuth()
@ApiTags('ai-local')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai-local')
export class AiLocalController {
  constructor(private readonly service: AiLocalService) {}

  @Get('health')
  health() {
    return this.service.health();
  }

  @Post('ask')
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  ask(@Body() dto: AiLocalQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.ask(dto, user);
  }

  @Get('index-status')
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  indexStatus() {
    return this.service.indexStatus();
  }

  @Post('rebuild-index')
  @Roles('ADMIN')
  rebuildIndex(@Body() dto: RebuildIndexDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.rebuildIndex(dto, user);
  }
}
