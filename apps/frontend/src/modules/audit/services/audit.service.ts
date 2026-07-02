import { httpClient } from '../../../services/http-client';
import { AuditLog } from '../types/audit.types';

export const auditService = {
  async findAll(params: Record<string, string | undefined>) {
    const { data } = await httpClient.get<{ items: AuditLog[] }>('/audit-logs', { params });
    return data.items;
  },
};
