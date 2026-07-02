import { ShieldCheck, UserCheck, UserRound, UserX } from 'lucide-react';
import { SystemUser } from '../types/user.types';

export function UserStats({ users }: { users: SystemUser[] }) {
  const active = users.filter((user) => user.isActive).length;
  const inactive = users.length - active;
  const admins = users.filter((user) => user.role.name === 'ADMIN').length;

  const stats = [
    { label: 'Usuarios', value: users.length, icon: UserRound, className: 'from-blue-600 to-cyan-500' },
    { label: 'Activos', value: active, icon: UserCheck, className: 'from-emerald-500 to-teal-500' },
    { label: 'Inactivos', value: inactive, icon: UserX, className: 'from-slate-500 to-slate-700' },
    { label: 'Administradores', value: admins, icon: ShieldCheck, className: 'from-violet-600 to-fuchsia-500' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{stat.value}</p>
              </div>
              <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${stat.className} text-white shadow-sm`}>
                <Icon size={20} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
