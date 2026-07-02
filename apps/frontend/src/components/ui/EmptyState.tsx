import { LucideIcon, Search } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon: Icon = Search, action }: EmptyStateProps) {
  return (
    <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <Icon size={22} />
        </div>
        <p className="mt-4 text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
