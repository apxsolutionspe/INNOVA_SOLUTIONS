import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ProfitabilityQueryDto {
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value)) @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value)) @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value)) @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => (typeof value === 'string' && !value.trim() ? undefined : value)) @IsString() productId?: string;
}
