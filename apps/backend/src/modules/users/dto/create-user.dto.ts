import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(80)
  password!: string;

  @ApiProperty()
  @IsString()
  @IsUUID()
  roleId!: string;
}
