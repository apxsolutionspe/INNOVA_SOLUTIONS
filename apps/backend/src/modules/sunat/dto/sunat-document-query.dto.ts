import { ApiPropertyOptional } from '@nestjs/swagger';
import { SunatDocumentStatus, SunatDocumentType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class SunatDocumentQueryDto {
  @ApiPropertyOptional({ enum: SunatDocumentType }) @IsOptional() @IsEnum(SunatDocumentType) documentType?: SunatDocumentType;
  @ApiPropertyOptional({ enum: SunatDocumentStatus }) @IsOptional() @IsEnum(SunatDocumentStatus) status?: SunatDocumentStatus;
}
