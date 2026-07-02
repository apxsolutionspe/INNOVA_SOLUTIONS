import { ShieldCheck, UserCog, Wrench } from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { getRoleLabel } from '../../../lib/rbac';

const roleStyles: Record<string, { className: string; icon: typeof ShieldCheck }> = {
  ADMIN: {
    className: 'border-violet-200 bg-violet-50 text-violet-700',
    icon: ShieldCheck,
  },
  WORKER: {
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: UserCog,
  },
  TECHNICIAN: {
    className: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    icon: Wrench,
  },
};

export function UserRoleBadge({ role }: { role: string }) {
  const config = roleStyles[role] ?? {
    className: 'border-slate-200 bg-slate-50 text-slate-600',
    icon: UserCog,
  };
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold', config.className)}>
      <Icon size={13} />
      {getRoleLabel(role)}
    </span>
  );
}
