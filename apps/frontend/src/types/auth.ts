export interface Role {
  id: string;
  name: 'ADMIN' | 'WORKER' | 'TECHNICIAN' | string;
  description?: string | null;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}
