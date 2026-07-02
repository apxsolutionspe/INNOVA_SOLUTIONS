import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateChargeDto } from './dto/create-charge.dto';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentsService } from './payments.service';

@ApiBearerAuth()
@ApiTags('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}
  @Roles('ADMIN') @Post('create-link') create(@Body() dto: CreatePaymentLinkDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createLink(dto, user); }
  @Roles('ADMIN') @Post('culqi/create-link') culqiLink(@Body() dto: CreatePaymentLinkDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createLink({ ...dto, provider: 'culqi' }, user); }
  @Roles('ADMIN') @Post('culqi/create-charge') culqiCharge(@Body() dto: CreateChargeDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createCharge(PaymentProvider.CULQI, dto, user); }
  @Post('culqi/webhook') culqiWebhook(@Body() dto: PaymentWebhookDto) { return this.service.webhook({ ...dto, provider: 'culqi' }); }
  @Roles('ADMIN') @Post('izipay/create-payment') izipayPayment(@Body() dto: CreatePaymentLinkDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createLink({ ...dto, provider: 'izipay' }, user); }
  @Roles('ADMIN') @Post('izipay/create-form-token') izipayToken(@Body() dto: CreatePaymentLinkDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createLink({ ...dto, provider: 'izipay' }, user); }
  @Post('izipay/webhook') izipayWebhook(@Body() dto: PaymentWebhookDto) { return this.service.webhook({ ...dto, provider: 'izipay' }); }
  @Roles('ADMIN') @Post('izipay/test-connection') izipayTest(@CurrentUser() user: AuthenticatedUser) { return this.service.testConnection(user); }
  @Post('webhook') webhook(@Body() dto: PaymentWebhookDto) { return this.service.webhook(dto); }
  @Roles('ADMIN') @Get('transactions') transactions(@Query() query: PaymentQueryDto) { return this.service.transactions(query); }
  @Roles('ADMIN') @Get('transactions/:id') transaction(@Param('id') id: string) { return this.service.status(id); }
  @Roles('ADMIN') @Get('status/:id') status(@Param('id') id: string) { return this.service.status(id); }
  @Roles('ADMIN') @Post('test-connection') test(@CurrentUser() user: AuthenticatedUser) { return this.service.testConnection(user); }
}
