import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateReceiptLinkDto } from './dto/create-receipt-link.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { SendReceiptDto } from './dto/send-receipt.dto';
import { SendSaleReceiptDto } from './dto/send-sale-receipt.dto';
import { SendServiceOrderDto } from './dto/send-service-order.dto';
import { SendTemplateMessageDto } from './dto/send-template-message.dto';
import { TestApprovedTemplateDto } from './dto/test-approved-template.dto';
import { TestTemplateDto } from './dto/test-template.dto';
import { WhatsappService } from './whatsapp.service';

@ApiBearerAuth()
@ApiTags('whatsapp')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}
  @Post('send-message') send(@Body() dto: SendMessageDto, @CurrentUser() user: AuthenticatedUser) { return this.service.sendMessage(dto, user); }
  @Post('test-text') testText(@Body() dto: SendMessageDto, @CurrentUser() user: AuthenticatedUser) { return this.service.testText(dto, user); }
  @Post('test-template') testTemplate(@Body() dto: TestTemplateDto, @CurrentUser() user: AuthenticatedUser) { return this.service.testTemplate(dto, user); }
  @Post('test-approved-template') testApprovedTemplate(@Body() dto: TestApprovedTemplateDto, @CurrentUser() user: AuthenticatedUser) { return this.service.testApprovedTemplate(dto, user); }
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  @Post('send-receipt') sendReceipt(@Body() dto: SendReceiptDto, @CurrentUser() user: AuthenticatedUser) { return this.service.sendReceipt(dto, user); }
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  @Post('receipt-link') receiptLink(@Body() dto: CreateReceiptLinkDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createReceiptLink(dto, user); }
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  @Post('send-sale-receipt') sale(@Body() dto: SendSaleReceiptDto, @CurrentUser() user: AuthenticatedUser) { return this.service.sendSaleReceipt(dto, user); }
  @Roles('ADMIN', 'WORKER', 'TECHNICIAN')
  @Post('send-sale-receipt-template') saleTemplate(@Body() dto: SendSaleReceiptDto, @CurrentUser() user: AuthenticatedUser) { return this.service.sendSaleReceiptTemplate(dto, user); }
  @Post('send-service-order') order(@Body() dto: SendServiceOrderDto, @CurrentUser() user: AuthenticatedUser) { return this.service.sendServiceOrder(dto, user); }
  @Post('send-template') template(@Body() dto: SendTemplateMessageDto, @CurrentUser() user: AuthenticatedUser) { return this.service.sendTemplate(dto, user); }
  @Post('send-notification') notification(@Body() dto: SendMessageDto, @CurrentUser() user: AuthenticatedUser) { return this.service.sendNotification(dto, user); }
  @Get('messages') messages() { return this.service.messages(); }
  @Post('test-connection') test(@CurrentUser() user: AuthenticatedUser) { return this.service.testConnection(user); }
}
