import { ClipboardList, CreditCard, LayoutDashboard, MoreHorizontal, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MobileQuickActions } from './MobileQuickActions';

const mainItems = [
  { label: 'Inicio', path: '/dashboard', icon: LayoutDashboard },
  { label: 'POS', path: '/pos', icon: ShoppingCart },
  { label: 'Órdenes', path: '/service-orders', icon: ClipboardList },
  { label: 'Caja', path: '/cash', icon: CreditCard },
];

export function MobileBottomNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid min-h-16 grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold ${isActive ? 'bg-blue-50 text-brand-blue' : 'text-slate-500'}`}>
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
        <button type="button" onClick={() => setIsMoreOpen(true)} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold text-slate-500">
          <MoreHorizontal size={20} />
          Más
        </button>
      </nav>
      {isMoreOpen ? <MobileQuickActions onClose={() => setIsMoreOpen(false)} /> : null}
    </>
  );
}
