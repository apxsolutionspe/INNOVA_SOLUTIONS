import { PartialType } from '@nestjs/swagger';
import { CreateQuickServiceCategoryDto } from './create-quick-service-category.dto';

export class UpdateQuickServiceCategoryDto extends PartialType(CreateQuickServiceCategoryDto) {}
