import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository, private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  updateLastLogin(id: string) {
    return this.usersRepository.updateLastLogin(id);
  }

  findAll() {
    return this.usersRepository.findAll();
  }

  async create(dto: CreateUserDto, admin: AuthenticatedUser) {
    if (await this.usersRepository.findByEmail(dto.email)) throw new ConflictException('Ya existe un usuario con ese email');
    await this.ensureRole(dto.roleId);
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepository.create({ ...dto, password });
    await this.audit(admin.id, 'CREATE_USER', `Usuario creado: ${user.email}`);
    return this.safe(user);
  }

  async update(id: string, dto: UpdateUserDto, admin: AuthenticatedUser) {
    const currentUser = await this.ensureUser(id);
    if (dto.email) {
      const existing = await this.usersRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) throw new ConflictException('Email ya registrado');
    }
    if (dto.roleId) {
      await this.ensureRole(dto.roleId);
      await this.ensureAdminContinuity(currentUser.id, currentUser.role.name, dto.roleId, currentUser.isActive);
    }
    const { password, ...data } = dto;
    const user = await this.usersRepository.update(id, data);
    await this.audit(admin.id, 'UPDATE_USER', `Usuario editado: ${user.email}`);
    return this.safe(user);
  }

  async changeStatus(id: string, isActive: boolean, admin: AuthenticatedUser) {
    const currentUser = await this.ensureUser(id);
    if (!isActive) {
      await this.ensureAdminContinuity(currentUser.id, currentUser.role.name, currentUser.roleId, false);
    }
    const user = await this.usersRepository.update(id, { isActive });
    await this.audit(admin.id, 'CHANGE_USER_STATUS', `${user.email}: ${isActive ? 'activo' : 'inactivo'}`);
    return this.safe(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto, admin: AuthenticatedUser) {
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepository.update(id, { password });
    await this.audit(admin.id, 'CHANGE_USER_PASSWORD', `Password actualizado: ${user.email}`);
    return this.safe(user);
  }

  private async ensureUser(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  private async ensureRole(roleId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new BadRequestException('Rol no válido');
    return role;
  }

  private async ensureAdminContinuity(userId: string, currentRoleName: string, nextRoleId: string, nextIsActive: boolean) {
    if (currentRoleName !== 'ADMIN') return;

    const nextRole = await this.ensureRole(nextRoleId);
    const remainsAdmin = nextRole.name === 'ADMIN' && nextIsActive;
    if (remainsAdmin) return;

    const otherActiveAdmins = await this.prisma.user.count({
      where: {
        id: { not: userId },
        isActive: true,
        role: { name: 'ADMIN' },
      },
    });

    if (otherActiveAdmins === 0) {
      throw new BadRequestException('No puedes dejar el sistema sin un administrador activo');
    }
  }

  private safe(user: any) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private audit(userId: string, action: string, description: string) {
    return this.prisma.auditLog.create({ data: { userId, module: 'users', action, description } });
  }
}
