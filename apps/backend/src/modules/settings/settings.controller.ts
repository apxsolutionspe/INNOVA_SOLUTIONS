import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { BusinessSettingsDto } from './dto/business-settings.dto';
import { SettingsService } from './settings.service';

@ApiBearerAuth()
@ApiTags('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}
  @Roles('ADMIN') @Get('business') business() { return this.service.business(); }
  @Roles('ADMIN') @Patch('business') update(@Body() dto: BusinessSettingsDto, @CurrentUser() user: AuthenticatedUser) { return this.service.updateBusiness(dto, user); }
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN') @Get('tax') tax() { return this.service.tax(); }
  @Roles('ADMIN') @Patch('tax') updateTax(@Body() dto: BusinessSettingsDto, @CurrentUser() user: AuthenticatedUser) { return this.service.updateTax(dto, user); }
}
