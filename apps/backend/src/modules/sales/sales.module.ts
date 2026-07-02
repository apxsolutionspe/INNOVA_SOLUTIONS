import { Module } from '@nestjs/common';

import { CashModule } from '../cash/cash.module';
import { SaleFacade } from './facades/sale.facade';
import { ReceiptPdfService } from './pdf/receipt-pdf.service';
import { SalesController } from './sales.controller';
import { SalesRepository } from './sales.repository';
import { SalesService } from './sales.service';
import { ProductSaleStrategy } from './strategies/product-sale.strategy';

@Module({
  imports: [CashModule],
  controllers: [SalesController],
  providers: [
    SalesService,
    SalesRepository,
    ProductSaleStrategy,
    SaleFacade,
    ReceiptPdfService,
  ],
  exports: [SalesService],
})
export class SalesModule {}
