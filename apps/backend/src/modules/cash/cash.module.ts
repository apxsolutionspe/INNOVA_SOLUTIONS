import { Module } from '@nestjs/common';

import { CashController } from './cash.controller';
import { CashRepository } from './cash.repository';
import { CashService } from './cash.service';

@Module({
  controllers: [CashController],
  providers: [CashService, CashRepository],
  exports: [CashService],
})
export class CashModule {}
