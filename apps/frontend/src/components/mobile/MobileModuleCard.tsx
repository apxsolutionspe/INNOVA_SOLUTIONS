import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MobileModuleCard({ label, path, icon: Icon, onClick }: { label: string; path: string; icon: LucideIcon; onClick?: () => void }) {
  return (
    <Link to={path} onClick={onClick} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-brand-blue"><Icon size={18} /></span>
      {label}
    </Link>
  );
}
