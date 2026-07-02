import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      include: { role: true },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    }).then((users) => users.map(({ password, ...user }) => user));
  }

  create(data: { fullName: string; email: string; password: string; roleId: string }) {
    return this.prisma.user.create({ data, include: { role: true } });
  }

  update(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data, include: { role: true } });
  }
}
