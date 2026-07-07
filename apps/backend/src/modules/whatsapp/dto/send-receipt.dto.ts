import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class SendReceiptDto {
  @ApiProperty({ enum: ['SALE', 'SERVICE_ORDER', 'QUICK_SERVICE'] })
  @IsIn(['SALE', 'SERVICE_ORDER', 'QUICK_SERVICE'])
  type!: 'SALE' | 'SERVICE_ORDER' | 'QUICK_SERVICE';

  @ApiProperty({ example: 'receipt-id-or-code' })
  @IsString()
  id!: string;

  @ApiProperty({ example: '931797758' })
  @IsString()
  @MinLength(9)
  @MaxLength(24)
  phone!: string;
}
