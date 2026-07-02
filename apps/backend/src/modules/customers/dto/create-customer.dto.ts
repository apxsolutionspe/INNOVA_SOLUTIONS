import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType, DocumentType } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ enum: CustomerType, example: CustomerType.NATURAL })
  @IsEnum(CustomerType)
  customerType!: CustomerType;

  @ApiProperty({ enum: DocumentType, example: DocumentType.DNI })
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MaxLength(20)
  documentNumber!: string;

  @ApiPropertyOptional({ example: 'Juan Perez' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Juan' })
  @ValidateIf((dto: CreateCustomerDto) => dto.customerType === CustomerType.NATURAL)
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Perez' })
  @ValidateIf((dto: CreateCustomerDto) => dto.customerType === CustomerType.NATURAL)
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @ApiPropertyOptional({ example: 'Comercial Nova Peru EIRL' })
  @ValidateIf((dto: CreateCustomerDto) => dto.customerType === CustomerType.COMPANY)
  @IsString()
  @MaxLength(160)
  businessName?: string;

  @ApiPropertyOptional({ example: 'Nova Peru' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  tradeName?: string;

  @ApiPropertyOptional({ example: 'Anthony Perez' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  legalRepresentative?: string;

  @ApiPropertyOptional({ example: '999888777' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'cliente@email.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @ApiPropertyOptional({ example: 'Av. Principal 123' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  address?: string;

  @ApiPropertyOptional({ example: 'Servicios tecnologicos' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  businessLine?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
