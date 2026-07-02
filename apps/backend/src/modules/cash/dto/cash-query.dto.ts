import { ApiPropertyOptional } from '@nestjs/swagger';
import { CashMovementType, PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class CashQueryDto {
  @ApiPropertyOptional({ enum: CashMovementType })
  @IsOptional()
  @IsEnum(CashMovementType)
  type?: CashMovementType;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
