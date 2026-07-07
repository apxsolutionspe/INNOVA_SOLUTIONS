import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsDateString, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

import { ServiceOrderPhotoDto } from './service-order-photo.dto';

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

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value.trim()))
  @IsString()
  @MaxLength(60)
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value.trim()))
  @IsString()
  @MaxLength(120)
  physicalCondition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value.trim()))
  @IsString()
  @MaxLength(300)
  accessoriesReceived?: string;

  @ApiProperty({ example: 'No enciende' })
  @IsString()
  @MaxLength(500)
  reportedIssue!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value.trim()))
  @IsString()
  @MaxLength(800)
  initialDiagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value.trim()))
  @IsString()
  @MaxLength(800)
  receptionNotes?: string;

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

  @ApiPropertyOptional({ type: [ServiceOrderPhotoDto] })
  @IsOptional()
  @ArrayMaxSize(6, { message: 'Solo puedes adjuntar hasta 6 fotos.' })
  @ValidateNested({ each: true })
  @Type(() => ServiceOrderPhotoDto)
  photos?: ServiceOrderPhotoDto[];
}
