import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class LookupDniDto {
  @ApiProperty({ example: '12345678' })
  @Matches(/^\d{8}$/, { message: 'El DNI debe tener exactamente 8 dígitos numéricos.' })
  dni!: string;
}
