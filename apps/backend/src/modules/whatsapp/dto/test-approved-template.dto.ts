import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class TestApprovedTemplateDto {
  @ApiProperty({ example: '51931797758' })
  @IsString()
  @MinLength(9)
  @MaxLength(15)
  @Matches(/^\d+$/, { message: 'El telefono debe contener solo numeros' })
  phone!: string;

  @ApiProperty({ required: false, default: 'comprobante_pdf', enum: ['comprobante_pdf', 'comprobante_venta', 'hello_world'] })
  @IsOptional()
  @IsString()
  @IsIn(['comprobante_pdf', 'comprobante_venta', 'hello_world'])
  template?: 'comprobante_pdf' | 'comprobante_venta' | 'hello_world';
}
