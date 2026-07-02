import { httpClient } from '../../../services/http-client';
import { Role } from '../../../types/auth';
import { SystemUser, UserPayload } from '../types/user.types';

export const usersService = {
  async findAll() { const { data } = await httpClient.get<SystemUser[]>('/users'); return data; },
  async create(payload: UserPayload) { const { data } = await httpClient.post<SystemUser>('/users', payload); return data; },
  async update(id: string, payload: Partial<UserPayload>) { const { data } = await httpClient.patch<SystemUser>(`/users/${id}`, payload); return data; },
  async status(id: string, isActive: boolean) { const { data } = await httpClient.patch<SystemUser>(`/users/${id}/status`, { isActive }); return data; },
  async changePassword(id: string, password: string) { const { data } = await httpClient.patch<SystemUser>(`/users/${id}/change-password`, { password }); return data; },
  async roles() { const { data } = await httpClient.get<Role[]>('/roles'); return data; },
};
