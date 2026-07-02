import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class SendTemplateMessageDto {
  @ApiProperty() @IsString() phone!: string;
  @ApiProperty() @IsString() templateName!: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() parameters?: Record<string, string>;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedModule?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedId?: string;
}
