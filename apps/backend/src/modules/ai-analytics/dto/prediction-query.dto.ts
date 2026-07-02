import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PredictionQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() horizon?: '7d' | '30d' | '90d';
}
