import { LucideIcon, PackageSearch } from 'lucide-react';

interface PosEmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function PosEmptyState({ title, description, icon: Icon = PackageSearch }: PosEmptyStateProps) {
  return (
    <div className="grid min-h-44 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <Icon size={22} />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
