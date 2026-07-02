import { Search, SlidersHorizontal } from 'lucide-react';
import { getRoleLabel } from '../../../lib/rbac';
import { Role } from '../../../types/auth';

interface UserFiltersProps {
  search: string;
  roleId: string;
  status: string;
  roles: Role[];
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function UserFilters({ search, roleId, status, roles, onSearchChange, onRoleChange, onStatusChange }: UserFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_190px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre o correo"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </label>
        <label className="relative block">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <select
            value={roleId}
            onChange={(event) => onRoleChange(event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">Todos los roles</option>
            {roles.map((role) => <option key={role.id} value={role.id}>{getRoleLabel(role)}</option>)}
          </select>
        </label>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>
  );
}
