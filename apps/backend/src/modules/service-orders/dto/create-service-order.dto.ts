import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateServiceOrderDto {
  @ApiProperty()
  @IsString()
  customerId!: string;

  @ApiProperty({ example: 'Laptop' })
  @IsString()
  @MaxLength(80)
  equipmentType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value.trim()))
  @IsString()
  @MaxLength(80)
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value.trim()))
  @IsString()
  @MaxLength(80)
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value.trim()))
  @IsString()
  @MaxLength(120)
  serialNumber?: string;

  @ApiProperty({ example: 'No enciende' })
  @IsString()
  @MaxLength(500)
  reportedIssue!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value))
  @IsDateString()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value.trim()))
  @IsString()
  @MaxLength(500)
  notes?: string;
}
