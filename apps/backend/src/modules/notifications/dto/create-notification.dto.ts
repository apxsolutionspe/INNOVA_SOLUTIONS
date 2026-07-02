import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPriority, NotificationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() userId?: string;
  @ApiProperty() @IsString() title!: string;
  @ApiProperty() @IsString() message!: string;
  @ApiPropertyOptional({ enum: NotificationType }) @IsOptional() @IsEnum(NotificationType) type?: NotificationType = NotificationType.SYSTEM;
  @ApiPropertyOptional({ enum: NotificationPriority }) @IsOptional() @IsEnum(NotificationPriority) priority?: NotificationPriority = NotificationPriority.MEDIUM;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedModule?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() relatedId?: string;
}
