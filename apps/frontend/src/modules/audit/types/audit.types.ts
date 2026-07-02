export interface AuditLog {
  id: string;
  action: string;
  module?: string;
  description?: string;
  entityId?: string;
  entityType?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: { fullName: string; email: string };
}
