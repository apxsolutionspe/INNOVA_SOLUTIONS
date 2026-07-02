import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() { return this.prisma.role.findMany({ orderBy: { name: 'asc' } }); }
  create(dto: CreateRoleDto) { return this.prisma.role.create({ data: dto }); }
  update(id: string, dto: Partial<CreateRoleDto>) { return this.prisma.role.update({ where: { id }, data: dto }); }
}
