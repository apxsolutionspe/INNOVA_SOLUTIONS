import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class TestTemplateDto {
  @ApiProperty({ example: '51931797758' })
  @IsString()
  @MinLength(9)
  @MaxLength(15)
  @Matches(/^\d+$/, { message: 'El telefono debe contener solo numeros' })
  phone!: string;
}
