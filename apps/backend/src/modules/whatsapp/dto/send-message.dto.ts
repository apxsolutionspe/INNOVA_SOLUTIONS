import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty() @IsString() phone!: string;
  @ApiProperty() @IsString() message!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedModule?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedId?: string;
}
