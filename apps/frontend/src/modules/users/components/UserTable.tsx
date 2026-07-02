import { KeyRound, Mail, Pencil, Power, UserRound } from 'lucide-react';
import { Button, TableShell } from '../../../components/ui';
import { SystemUser } from '../types/user.types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';

export function UserTable({ users, onEdit, onStatus, onPassword }: { users: SystemUser[]; onEdit: (user: SystemUser) => void; onStatus: (user: SystemUser) => void; onPassword: (user: SystemUser) => void }) {
  const getInitials = (name: string) => name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <TableShell maxHeight="clamp(360px,52vh,620px)" className="hidden rounded-none border-0 shadow-none lg:block">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs font-black uppercase tracking-wide text-slate-500 backdrop-blur">
            <tr>
              <th className="px-5 py-4">Usuario</th>
              <th className="px-5 py-4">Rol</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="group transition hover:bg-blue-50/35">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white shadow-sm">
                      {getInitials(user.fullName) || <UserRound size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black text-slate-950">{user.fullName}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                        <Mail size={13} />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><UserRoleBadge role={user.role.name} /></td>
                <td className="px-5 py-4">
                  <button type="button" onClick={() => onStatus(user)} className="rounded-full outline-none transition hover:scale-[1.02] focus:ring-2 focus:ring-blue-200">
                    <UserStatusBadge isActive={user.isActive} />
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(user)} className="rounded-full">
                      <Pencil size={15} /> Editar
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => onPassword(user)} className="rounded-full">
                      <KeyRound size={15} /> Clave
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <div className="table-scroll-shell grid max-h-[70vh] gap-3 overflow-y-auto p-3 lg:hidden">
        {users.map((user) => (
          <article key={user.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-black text-white">
                {getInitials(user.fullName) || <UserRound size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-slate-950">{user.fullName}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <UserRoleBadge role={user.role.name} />
                  <button type="button" onClick={() => onStatus(user)} className="rounded-full">
                    <UserStatusBadge isActive={user.isActive} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(user)} className="rounded-full">
                <Pencil size={14} /> Editar
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onPassword(user)} className="rounded-full">
                <KeyRound size={14} /> Clave
              </Button>
              <Button type="button" variant={user.isActive ? 'ghost' : 'secondary'} size="sm" onClick={() => onStatus(user)} className="rounded-full">
                <Power size={14} /> {user.isActive ? 'Pausar' : 'Activar'}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
