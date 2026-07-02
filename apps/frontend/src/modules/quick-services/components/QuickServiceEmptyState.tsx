import { LucideIcon, Sparkles } from 'lucide-react';

interface QuickServiceEmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function QuickServiceEmptyState({ title, description, icon: Icon = Sparkles }: QuickServiceEmptyStateProps) {
  return (
    <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-violet-50 text-brand-violet">
          <Icon size={22} />
        </div>
        <p className="mt-4 text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
