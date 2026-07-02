import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SunatConfigDto {
  @ApiPropertyOptional() @IsOptional() @IsString() environment?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ruc?: string;
}
