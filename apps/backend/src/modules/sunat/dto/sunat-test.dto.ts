import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SunatTestDto {
  @ApiPropertyOptional() @IsOptional() @IsString() ruc?: string;
}
