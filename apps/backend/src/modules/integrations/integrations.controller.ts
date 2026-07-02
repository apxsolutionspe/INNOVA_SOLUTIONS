import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IntegrationProvider } from '@prisma/client';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { IntegrationConfigDto } from './dto/integration-config.dto';
import { UpdateIntegrationStatusDto } from './dto/update-integration-status.dto';
import { IntegrationsService } from './integrations.service';

@ApiBearerAuth()
@ApiTags('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Get()
  @Roles('ADMIN', 'WORKER')
  status() {
    return this.service.status();
  }

  @Get(':provider')
  @Roles('ADMIN', 'WORKER')
  get(@Param('provider') provider: IntegrationProvider) {
    return this.service.get(provider);
  }

  @Patch(':provider/config')
  @Roles('ADMIN')
  updateConfig(@Param('provider') provider: IntegrationProvider, @Body() dto: IntegrationConfigDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.updateConfig(provider, dto, user);
  }

  @Post(':provider/test')
  @Roles('ADMIN')
  test(@Param('provider') provider: IntegrationProvider, @CurrentUser() user: AuthenticatedUser) {
    return this.service.test(provider, user);
  }

  @Patch(':provider/status')
  @Roles('ADMIN')
  updateStatus(@Param('provider') provider: IntegrationProvider, @Body() dto: UpdateIntegrationStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.updateStatus(provider, dto, user);
  }
}
