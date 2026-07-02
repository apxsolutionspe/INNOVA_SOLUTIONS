import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class OnlineOrderItemDto {
  @ApiProperty() @IsString() productId!: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(1) quantity!: number;
}

export class CreateOnlineOrderDto {
  @ApiProperty() @IsString() customerName!: string;
  @ApiProperty() @IsString() customerPhone!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() customerEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deliveryAddress?: string;
  @ApiProperty({ type: [OnlineOrderItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => OnlineOrderItemDto) items!: OnlineOrderItemDto[];
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(0) deliveryCost?: number = 0;
  @ApiPropertyOptional({ enum: PaymentMethod }) @IsOptional() @IsEnum(PaymentMethod) paymentMethod?: PaymentMethod;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
