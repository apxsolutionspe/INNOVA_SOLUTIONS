import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReceiptLinkDto {
  @ApiProperty({ enum: ['SALE', 'SERVICE_ORDER', 'QUICK_SERVICE'] })
  @IsIn(['SALE', 'SERVICE_ORDER', 'QUICK_SERVICE'])
  type!: 'SALE' | 'SERVICE_ORDER' | 'QUICK_SERVICE';

  @ApiProperty({ example: 'receipt-id-or-code' })
  @IsString()
  id!: string;

  @ApiProperty({ required: false, example: '+51 999 999 999' })
  @IsOptional()
  @IsString()
  @MinLength(9)
  @MaxLength(24)
  phone?: string;
}
