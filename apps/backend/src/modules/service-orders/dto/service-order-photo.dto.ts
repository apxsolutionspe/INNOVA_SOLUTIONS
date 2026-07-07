import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;

export class ServiceOrderPhotoDto {
  @ApiPropertyOptional({ description: 'Imagen en Data URL/Base64 validada desde el frontend.' })
  @IsString()
  imageData!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  fileName?: string;

  @ApiPropertyOptional({ enum: allowedMimeTypes })
  @IsString()
  @IsIn(allowedMimeTypes, { message: 'Formato no permitido. Usa JPG, PNG o WEBP.' })
  mimeType!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2 * 1024 * 1024, { message: 'La imagen no debe superar 2 MB.' })
  sizeBytes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  note?: string;
}
