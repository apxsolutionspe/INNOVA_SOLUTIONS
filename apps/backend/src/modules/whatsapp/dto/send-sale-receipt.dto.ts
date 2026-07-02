import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SendSaleReceiptDto {
  @ApiProperty({ example: 'sale-uuid' })
  @IsString()
  saleId!: string;

  @ApiProperty({ example: '51999999999' })
  @IsString()
  @MinLength(9)
  @MaxLength(15)
  @Matches(/^\d+$/, { message: 'El telefono debe contener solo numeros' })
  phone!: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  sendPdf?: boolean;

  @ApiProperty({ required: false, enum: ['COMPROBANTE', 'BOLETA_PRUEBA', 'FACTURA_PRUEBA'] })
  @IsOptional()
  @IsString()
  @IsIn(['COMPROBANTE', 'BOLETA_PRUEBA', 'FACTURA_PRUEBA'])
  documentType?: 'COMPROBANTE' | 'BOLETA_PRUEBA' | 'FACTURA_PRUEBA';

  @ApiProperty({ required: false, enum: ['auto', 'template_test', 'receipt_template', 'receipt_pdf', 'text', 'document'] })
  @IsOptional()
  @IsIn(['auto', 'template_test', 'receipt_template', 'receipt_pdf', 'text', 'document'])
  sendStrategy?: 'auto' | 'template_test' | 'receipt_template' | 'receipt_pdf' | 'text' | 'document';

  @ApiProperty({ required: false, enum: ['auto', 'template_test', 'receipt_template', 'receipt_pdf', 'text', 'document'] })
  @IsOptional()
  @IsIn(['auto', 'template_test', 'receipt_template', 'receipt_pdf', 'text', 'document'])
  mode?: 'auto' | 'template_test' | 'receipt_template' | 'receipt_pdf' | 'text' | 'document';
}
