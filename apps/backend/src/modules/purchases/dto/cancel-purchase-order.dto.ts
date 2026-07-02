import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CancelPurchaseOrderDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  reason!: string;
}
