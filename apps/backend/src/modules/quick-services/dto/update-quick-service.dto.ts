import { PartialType } from '@nestjs/swagger';
import { CreateQuickServiceDto } from './create-quick-service.dto';

export class UpdateQuickServiceDto extends PartialType(CreateQuickServiceDto) {}
