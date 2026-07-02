import { MoreHorizontal } from 'lucide-react';
import { ReactNode, useState } from 'react';

export function ActionMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex">
      <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
        <MoreHorizontal size={17} />
      </button>
      {open ? (
        <div className="absolute right-0 top-10 z-20 min-w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
          {children}
        </div>
      ) : null}
    </div>
  );
}
