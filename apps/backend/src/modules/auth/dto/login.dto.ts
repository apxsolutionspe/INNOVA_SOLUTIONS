import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@innovasolutions.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin12345' })
  @IsString()
  @MinLength(8)
  password!: string;
}
