import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ValidateNested } from 'class-validator';

import { ServiceOrderPhotoDto } from './service-order-photo.dto';

export class AddServiceOrderPhotosDto {
  @ApiProperty({ type: [ServiceOrderPhotoDto] })
  @ArrayMinSize(1)
  @ArrayMaxSize(6, { message: 'Solo puedes adjuntar hasta 6 fotos.' })
  @ValidateNested({ each: true })
  @Type(() => ServiceOrderPhotoDto)
  photos!: ServiceOrderPhotoDto[];
}
