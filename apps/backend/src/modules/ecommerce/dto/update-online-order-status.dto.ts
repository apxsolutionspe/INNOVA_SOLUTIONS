import { ApiProperty } from '@nestjs/swagger';
import { OnlineOrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOnlineOrderStatusDto {
  @ApiProperty({ enum: OnlineOrderStatus })
  @IsEnum(OnlineOrderStatus)
  status!: OnlineOrderStatus;
}
