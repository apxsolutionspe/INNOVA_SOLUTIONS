import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaymentProviderConfigDto {
  @ApiPropertyOptional() @IsOptional() @IsString() provider?: 'culqi' | 'izipay';
}
