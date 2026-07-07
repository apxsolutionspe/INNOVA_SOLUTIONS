import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Memoria RAM DDR4 8GB' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'RAM-DDR4-8GB' })
  @IsString()
  @MaxLength(60)
  sku!: string;

  @ApiPropertyOptional({ example: '7750001234567' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  barcode?: string;

  @ApiPropertyOptional({ example: '/images/products/memoria-ram-8gb.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(3000000)
  @Matches(/^(data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+|\/images\/[^\s"'<>]+|https:\/\/[^\s"'<>]+)$/i, {
    message: 'La imagen debe ser JPG, PNG, WEBP, una ruta /images/ o una URL HTTPS valida.',
  })
  imageUrl?: string | null;

  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiProperty({ example: 85 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiProperty({ example: 120 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  salePrice!: number;

  @ApiProperty({ example: 10 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({ example: 3 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  minStock!: number;

  @ApiProperty({ example: 'unidad' })
  @IsString()
  @MaxLength(30)
  unit!: string;
}
