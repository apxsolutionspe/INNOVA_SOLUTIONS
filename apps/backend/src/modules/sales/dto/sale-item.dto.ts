import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SaleItemType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SaleItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ enum: SaleItemType, example: SaleItemType.PRODUCT })
  @IsEnum(SaleItemType)
  itemType!: SaleItemType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: 0 })
  @Transform(({ value }) => Number(value ?? 0))
  @IsOptional()
  @Min(0)
  discount?: number = 0;
}
