import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendServiceOrderDto {
  @ApiProperty() @IsString() phone!: string;
  @ApiProperty() @IsString() orderCode!: string;
  @ApiProperty() @IsString() status!: string;
}
