import { Role, User } from '@prisma/client';

export type UserWithRole = User & {
  role: Role;
};

export type AuthenticatedUser = Omit<UserWithRole, 'password'>;

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
