import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { DocumentLookupController } from './document-lookup.controller';
import { DocumentLookupService } from './document-lookup.service';
import { JsonpeProvider } from './providers/jsonpe.provider';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentLookupController],
  providers: [DocumentLookupService, JsonpeProvider],
})
export class DocumentLookupModule {}
