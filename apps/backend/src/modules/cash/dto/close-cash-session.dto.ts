import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CloseCashSessionDto {
  @ApiProperty({ example: 350 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  realCashAmount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
