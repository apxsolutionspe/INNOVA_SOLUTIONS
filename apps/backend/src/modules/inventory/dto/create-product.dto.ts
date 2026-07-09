import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsObject, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

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
    message: 'La imagen debe ser JPG, PNG, WEBP, una ruta /images/ o una URL HTTPS válida.',
  })
  imageUrl?: string | null;

  @ApiPropertyOptional({ example: 'Lenovo' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  brand?: string;

  @ApiPropertyOptional({ example: 'IdeaPad' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  model?: string;

  @ApiPropertyOptional({ example: '12 meses, validar con proveedor' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  warranty?: string;

  @ApiPropertyOptional({ example: 'Oficina, estudios y gestion empresarial' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  recommendedUse?: string;

  @ApiPropertyOptional({ example: 'Buen equilibrio entre rendimiento y precio.' })
  @IsOptional()
  @IsString()
  @MaxLength(700)
  salesNotes?: string;

  @ApiPropertyOptional({
    example: {
      Sistema: { Procesador: 'Intel Core i5', Generacion: '12.a generacion referencial' },
      'Memoria y almacenamiento': { 'Memoria RAM': '8 GB DDR4', Almacenamiento: 'SSD 512 GB' },
    },
  })
  @IsOptional()
  @IsObject()
  technicalSpecs?: Record<string, unknown>;

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
