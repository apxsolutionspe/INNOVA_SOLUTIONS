import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class LookupRucDto {
  @ApiProperty({ example: '20123456789' })
  @Matches(/^\d{11}$/, { message: 'El RUC debe tener exactamente 11 dígitos numéricos.' })
  ruc!: string;
}
