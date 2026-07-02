import { AuthUser, Role } from '../types/auth';

export type AppRole = 'ADMIN' | 'WORKER' | 'TECHNICIAN' | string;

const ADMIN_ONLY_MODULES = new Set([
  'profitability',
  'settings',
  'users',
  'audit',
  'integrations',
  'sunat',
  'whatsapp',
  'payments',
  'ai-analytics',
  'ecommerce',
  'online-orders',
]);

const ROLE_PRESENTATION: Record<string, { name: string; badge: string; initials: string }> = {
  ADMIN: { name: 'Administrador', badge: 'ADMINISTRADOR', initials: 'AI' },
  WORKER: { name: 'Empleado', badge: 'EMPLEADO', initials: 'E' },
  TECHNICIAN: { name: 'Técnico', badge: 'TÉCNICO', initials: 'T' },
  CASHIER: { name: 'Cajero', badge: 'CAJERO', initials: 'C' },
};

export function isAdmin(user?: AuthUser | null) {
  return user?.role.name === 'ADMIN';
}

export function isAdminRole(role?: AppRole | null) {
  return role === 'ADMIN';
}

export function canAccessModule(user: AuthUser | null | undefined, moduleKey: string) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return !ADMIN_ONLY_MODULES.has(moduleKey);
}

export function getRoleLabel(role?: Role | string | null) {
  const roleName = typeof role === 'string' ? role : role?.name;
  return roleName ? ROLE_PRESENTATION[roleName]?.name ?? roleName : 'Sin rol';
}

export function getRoleBadgeLabel(role?: Role | string | null) {
  const roleName = typeof role === 'string' ? role : role?.name;
  return roleName ? ROLE_PRESENTATION[roleName]?.badge ?? roleName.toUpperCase() : 'SIN ROL';
}

export function getDisplayUserName(user?: AuthUser | null) {
  if (!user) return 'Usuario';
  return ROLE_PRESENTATION[user.role.name]?.name ?? user.fullName;
}

export function getRoleInitials(role?: Role | string | null, fullName?: string) {
  const roleName = typeof role === 'string' ? role : role?.name;
  if (roleName && ROLE_PRESENTATION[roleName]?.initials) return ROLE_PRESENTATION[roleName].initials;

  return fullName
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';
}
