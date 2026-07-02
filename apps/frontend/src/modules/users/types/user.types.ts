import { Role } from '../../../types/auth';

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  roleId: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserPayload {
  fullName: string;
  email: string;
  password?: string;
  roleId: string;
}
