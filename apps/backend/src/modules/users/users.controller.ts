import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeUserStatusDto } from './dto/change-user-status.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthenticatedUser) { return this.service.create(dto, user); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: AuthenticatedUser) { return this.service.update(id, dto, user); }
  @Patch(':id/status') status(@Param('id') id: string, @Body() dto: ChangeUserStatusDto, @CurrentUser() user: AuthenticatedUser) { return this.service.changeStatus(id, dto.isActive, user); }
  @Patch(':id/change-password') password(@Param('id') id: string, @Body() dto: ChangePasswordDto, @CurrentUser() user: AuthenticatedUser) { return this.service.changePassword(id, dto, user); }
}
