import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AiQueryDto {
  @ApiProperty() @IsString() @MinLength(3) question!: string;
}
