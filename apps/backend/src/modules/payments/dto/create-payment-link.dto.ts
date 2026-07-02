import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentLinkDto {
  @ApiProperty() @IsNumber() @Min(1) amount!: number;
  @ApiProperty() @IsString() description!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() provider?: 'culqi' | 'izipay';
  @ApiPropertyOptional() @IsOptional() @IsString() relatedModule?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedId?: string;
}
