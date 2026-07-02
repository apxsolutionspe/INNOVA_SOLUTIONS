import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AiLocalQueryDto {
  @ApiProperty({ example: 'Que productos debo reponer?' })
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  question!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  useRag?: boolean = true;
}
