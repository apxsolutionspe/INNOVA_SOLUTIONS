import { ApiProperty } from '@nestjs/swagger';
import { InventoryMovementType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString, MaxLength, Min } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ enum: InventoryMovementType, example: InventoryMovementType.IN })
  @IsEnum(InventoryMovementType)
  type!: InventoryMovementType;

  @ApiProperty({ example: 5 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiProperty({ example: 'Compra de mercaderia' })
  @IsString()
  @MaxLength(250)
  reason!: string;
}
