import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { CreateDebitNoteDto } from './dto/create-debit-note.dto';
import { CreateBoletaDto } from './dto/create-boleta.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { SunatDocumentQueryDto } from './dto/sunat-document-query.dto';
import { SunatService } from './sunat.service';

@ApiBearerAuth()
@ApiTags('sunat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sunat')
export class SunatController {
  constructor(private readonly service: SunatService) {}
  @Post('boleta') boleta(@Body() dto: CreateBoletaDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createBoleta(dto, user); }
  @Post('factura') factura(@Body() dto: CreateInvoiceDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createFactura(dto, user); }
  @Post('nota-credito') credit(@Body() dto: CreateCreditNoteDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createCreditNote(dto, user); }
  @Post('nota-debito') debit(@Body() dto: CreateDebitNoteDto, @CurrentUser() user: AuthenticatedUser) { return this.service.createDebitNote(dto, user); }
  @Get('documents') documents(@Query() query: SunatDocumentQueryDto) { return this.service.documents(query); }
  @Get('documents/:id') document(@Param('id') id: string) { return this.service.document(id); }
  @Get('documents/:id/status') status(@Param('id') id: string) { return this.service.documentStatus(id); }
  @Get('config') config() { return this.service.configStatus(); }
  @Post('test-connection') test(@CurrentUser() user: AuthenticatedUser) { return this.service.testConnection(user); }
}
