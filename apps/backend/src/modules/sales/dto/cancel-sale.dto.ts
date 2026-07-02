import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CancelSaleDto {
  @ApiProperty({ example: 'Cliente solicito anulacion del comprobante' })
  @IsString()
  @MinLength(5)
  reason!: string;
}
