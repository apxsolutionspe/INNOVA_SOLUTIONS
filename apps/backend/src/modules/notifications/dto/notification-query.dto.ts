import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPriority, NotificationType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class NotificationQueryDto {
  @ApiPropertyOptional() @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() isRead?: boolean;
  @ApiPropertyOptional({ enum: NotificationType }) @IsOptional() @IsEnum(NotificationType) type?: NotificationType;
  @ApiPropertyOptional({ enum: NotificationPriority }) @IsOptional() @IsEnum(NotificationPriority) priority?: NotificationPriority;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Transform(({ value }) => Number(value)) @IsInt() @Min(1) @Max(100) limit = 20;
}
