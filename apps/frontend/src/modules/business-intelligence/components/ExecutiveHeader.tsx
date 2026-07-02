import { ReactNode } from 'react';

interface ExecutiveHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  meta?: string;
  actions?: ReactNode;
}

export function ExecutiveHeader({ title, description, eyebrow, meta, actions }: ExecutiveHeaderProps) {
  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="text-xs font-black uppercase text-brand-blue">{eyebrow}</p> : null}
          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
          {meta ? <p className="mt-3 text-xs font-bold text-slate-400">{meta}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
