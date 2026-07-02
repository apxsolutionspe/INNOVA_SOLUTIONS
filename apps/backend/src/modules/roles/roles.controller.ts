import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@ApiBearerAuth()
@ApiTags('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() dto: CreateRoleDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: Partial<CreateRoleDto>) { return this.service.update(id, dto); }
}
