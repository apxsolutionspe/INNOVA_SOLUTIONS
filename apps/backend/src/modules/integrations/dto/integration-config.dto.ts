import { ApiPropertyOptional } from '@nestjs/swagger';
import { IntegrationMode } from '@prisma/client';
import { IsBoolean, IsEnum, IsObject, IsOptional } from 'class-validator';

export class IntegrationConfigDto {
  @ApiPropertyOptional({ enum: IntegrationMode })
  @IsOptional()
  @IsEnum(IntegrationMode)
  mode?: IntegrationMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  publicConfig?: Record<string, unknown>;
}
