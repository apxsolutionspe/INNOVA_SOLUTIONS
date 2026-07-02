import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { Type, Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { QuickServiceSaleItemDto } from './quick-service-sale-item.dto';

export class CreateQuickServiceSaleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ type: [QuickServiceSaleItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuickServiceSaleItemDto)
  items!: QuickServiceSaleItemDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Transform(({ value }) => Number(value ?? 0))
  @Min(0)
  discount?: number = 0;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
