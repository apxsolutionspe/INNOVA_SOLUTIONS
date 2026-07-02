import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CashMovementType, PaymentMethod } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCashMovementDto {
  @ApiProperty({ enum: CashMovementType, example: CashMovementType.EXPENSE })
  @IsEnum(CashMovementType)
  type!: CashMovementType;

  @ApiProperty({ example: 'Compra de insumos' })
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  concept!: string;

  @ApiProperty({ example: 25 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
