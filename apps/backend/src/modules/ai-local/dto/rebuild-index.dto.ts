import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class RebuildIndexDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeDocs?: boolean = true;
}
