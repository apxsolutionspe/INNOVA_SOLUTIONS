import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty() @IsString() provider!: string;
  @ApiProperty() @IsString() event!: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() payload?: Record<string, unknown>;
}
