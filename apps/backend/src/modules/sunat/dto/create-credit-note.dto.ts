import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCreditNoteDto {
  @ApiProperty() @IsString() relatedDocumentId!: string;
  @ApiProperty() @IsString() reason!: string;
  @ApiProperty() @IsNumber() @Min(0) total!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedSaleId?: string;
}
