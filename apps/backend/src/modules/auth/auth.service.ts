import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser, UserWithRole } from './types/authenticated-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const updatedUser = await this.usersService.updateLastLogin(user.id);
    await this.prisma.auditLog.create({
      data: { userId: user.id, module: 'auth', action: 'LOGIN', description: `Inicio de sesion: ${user.email}` },
    });
    const safeUser = this.toSafeUser(updatedUser);
    const accessToken = await this.generateToken(safeUser);

    return {
      user: safeUser,
      accessToken,
    };
  }

  getProfile(user: AuthenticatedUser) {
    return user;
  }

  private async generateToken(user: AuthenticatedUser) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role.name,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') ?? '1d') as never,
      },
    );
  }

  private toSafeUser(user: UserWithRole): AuthenticatedUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
