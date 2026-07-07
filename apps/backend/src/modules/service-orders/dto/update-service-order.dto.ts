import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateServiceOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(800)
  technicalDiagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(800)
  initialDiagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(800)
  receptionNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  physicalCondition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  accessoriesReceived?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(800)
  solutionApplied?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  laborCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
