import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CashService } from './cash.service';
import { CashQueryDto } from './dto/cash-query.dto';
import { CloseCashSessionDto } from './dto/close-cash-session.dto';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { OpenCashSessionDto } from './dto/open-cash-session.dto';

@ApiBearerAuth()
@ApiTags('cash')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Post('open')
  open(@Body() dto: OpenCashSessionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cashService.open(dto, user);
  }

  @Get('current')
  current(@CurrentUser() user: AuthenticatedUser) {
    return this.cashService.current(user);
  }

  @Get('sessions')
  sessions(@CurrentUser() user: AuthenticatedUser) {
    return this.cashService.sessions(user);
  }

  @Get('sessions/:id')
  findSession(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.cashService.findSession(id, user);
  }

  @Post('movements')
  createMovement(@Body() dto: CreateCashMovementDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cashService.createMovement(dto, user);
  }

  @Get('movements')
  movements(@Query() query: CashQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cashService.movements(query, user);
  }

  @Post('close')
  close(@Body() dto: CloseCashSessionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cashService.close(dto, user);
  }

  @Get('summary')
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.cashService.summary(user);
  }
}
