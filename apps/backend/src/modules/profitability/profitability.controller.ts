import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfitabilityQueryDto } from './dto/profitability-query.dto';
import { ProfitabilityService } from './profitability.service';

@ApiBearerAuth()
@ApiTags('profitability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('profitability')
export class ProfitabilityController {
  constructor(private readonly service: ProfitabilityService) {}
  @Get('summary') summary(@Query() query: ProfitabilityQueryDto) { return this.service.summary(query); }
  @Get('products') products(@Query() query: ProfitabilityQueryDto) { return this.service.products(query); }
  @Get('services') services(@Query() query: ProfitabilityQueryDto) { return this.service.services(query); }
  @Get('monthly') monthly(@Query() query: ProfitabilityQueryDto) { return this.service.monthly(query); }
  @Get('categories') categories(@Query() query: ProfitabilityQueryDto) { return this.service.categories(query); }
}
