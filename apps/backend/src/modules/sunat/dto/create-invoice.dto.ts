import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty() @IsString() customerName!: string;
  @ApiProperty() @IsString() customerDocument!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerDocumentType?: string;
  @ApiProperty() @IsArray() items!: Array<{ description: string; quantity: number; unitPrice: number }>;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) subtotal?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) taxTotal?: number;
  @ApiProperty() @IsNumber() @Min(0) total!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedSaleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedServiceOrderId?: string;
}
