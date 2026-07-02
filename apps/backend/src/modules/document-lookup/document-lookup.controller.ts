import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentLookupService } from './document-lookup.service';

@ApiBearerAuth()
@ApiTags('document-lookup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'WORKER', 'TECHNICIAN')
@Controller('document-lookup')
export class DocumentLookupController {
  constructor(private readonly service: DocumentLookupService) {}

  @Roles('ADMIN')
  @Get('status')
  status() {
    return this.service.getStatus();
  }

  @Get('dni/:dni')
  lookupDni(@Param('dni') dni: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.lookupDni(dni, user);
  }

  @Get('ruc/:ruc')
  lookupRuc(@Param('ruc') ruc: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.lookupRuc(ruc, user);
  }
}
