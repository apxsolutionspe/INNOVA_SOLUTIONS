import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateChargeDto {
  @ApiProperty() @IsNumber() @Min(1) amount!: number;
  @ApiProperty() @IsString() currency!: string;
  @ApiProperty() @IsString() token!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedSaleId?: string;
}
