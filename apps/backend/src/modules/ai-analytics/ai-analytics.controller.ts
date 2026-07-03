import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AiAnalyticsService } from './ai-analytics.service';
import { AiQueryDto } from './dto/ai-query.dto';

@ApiBearerAuth()
@ApiTags('ai-analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai-analytics')
export class AiAnalyticsController {
  constructor(private readonly service: AiAnalyticsService) {}
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  @Get('business-summary') summary() { return this.service.businessSummary(); }
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  @Get('sales-insights') sales() { return this.service.salesInsights(); }
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  @Get('inventory-insights') inventory() { return this.service.inventoryInsights(); }
  @Roles('ADMIN')
  @Get('profitability-insights') profitability() { return this.service.profitabilityInsights(); }
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  @Post('ask') ask(@Body() dto: AiQueryDto, @CurrentUser() user: AuthenticatedUser) { return this.service.ask(dto, user); }
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  @Get('test-connection') testGet(@CurrentUser() user: AuthenticatedUser) { return this.service.testConnection(user); }
  @Roles('ADMIN')
  @Post('test-connection') test(@CurrentUser() user: AuthenticatedUser) { return this.service.testConnection(user); }
}
