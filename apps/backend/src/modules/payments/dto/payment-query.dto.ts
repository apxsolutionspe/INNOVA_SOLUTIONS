import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider, PaymentTransactionStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class PaymentQueryDto {
  @ApiPropertyOptional({ enum: PaymentProvider }) @IsOptional() @IsEnum(PaymentProvider) provider?: PaymentProvider;
  @ApiPropertyOptional({ enum: PaymentTransactionStatus }) @IsOptional() @IsEnum(PaymentTransactionStatus) status?: PaymentTransactionStatus;
}
