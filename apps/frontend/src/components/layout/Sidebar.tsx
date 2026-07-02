import {
  BarChart3,
  Boxes,
  Bot,
  BriefcaseBusiness,
  ClipboardList,
  CreditCard,
  Home,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { canAccessModule } from '../../lib/rbac';
import { useAuthStore } from '../../store/auth.store';

type NavItem = {
  label: string;
  icon: LucideIcon;
  path: string;
  moduleKey: string;
};

const navigationItems: NavItem[] = [
  { label: 'Inicio', icon: Home, path: '/dashboard', moduleKey: 'dashboard' },
  { label: 'POS', icon: ShoppingCart, path: '/pos', moduleKey: 'pos' },
  { label: 'Ventas', icon: ReceiptText, path: '/sales', moduleKey: 'sales' },
  { label: 'Clientes', icon: Users, path: '/customers', moduleKey: 'customers' },
  { label: 'Inventario', icon: Boxes, path: '/inventory', moduleKey: 'inventory' },
  { label: 'Órdenes técnicas', icon: ClipboardList, path: '/service-orders', moduleKey: 'service-orders' },
  { label: 'Servicios rápidos', icon: Zap, path: '/quick-services', moduleKey: 'quick-services' },
  { label: 'Compras', icon: ShoppingBag, path: '/purchases', moduleKey: 'purchases' },
  { label: 'Proveedores', icon: Truck, path: '/suppliers', moduleKey: 'suppliers' },
  { label: 'Caja', icon: CreditCard, path: '/cash', moduleKey: 'cash' },
  { label: 'Reportes', icon: ReceiptText, path: '/reports', moduleKey: 'reports' },
  { label: 'Rentabilidad', icon: BarChart3, path: '/profitability', moduleKey: 'profitability' },
  { label: 'IA Analytics', icon: Bot, path: '/ai-analytics', moduleKey: 'ai-analytics' },
  { label: 'Usuarios', icon: Users, path: '/users', moduleKey: 'users' },
  { label: 'Auditoría', icon: ShieldCheck, path: '/audit', moduleKey: 'audit' },
  { label: 'Configuración', icon: Settings, path: '/settings', moduleKey: 'settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function isActivePath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function SidebarContent({ onClose, compactClose = false }: { onClose?: () => void; compactClose?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const visibleItems = navigationItems.filter((item) => canAccessModule(user, item.moduleKey));

  const handleGoHome = () => {
    navigate('/dashboard');
    onClose?.();
  };

  return (
    <>
      <div className="relative flex shrink-0 items-center justify-between gap-3 overflow-hidden border-b border-white/10 px-5 py-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(6,182,212,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.055),transparent)]" />
        <button
          type="button"
          onClick={handleGoHome}
          className="relative flex min-w-0 items-center gap-3 rounded-2xl text-left outline-none transition duration-200 hover:translate-x-0.5 focus-visible:ring-2 focus-visible:ring-brand-cyan"
          aria-label="Ir al inicio"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue via-brand-cyan to-brand-violet text-white shadow-[0_14px_34px_rgba(6,182,212,0.24)] ring-1 ring-white/20">
            <BriefcaseBusiness size={22} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-black tracking-wide text-white">Innova Solutions</p>
            <p className="mt-0.5 text-xs font-semibold text-cyan-100/75">Manager Suite</p>
          </div>
        </button>

        {compactClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú lateral"
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 shadow-sm transition duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            title="Cerrar menú"
          >
            <X size={19} />
          </button>
        ) : null}
      </div>

      <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Menú principal</div>
        <div className="space-y-1.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(location.pathname, item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex h-11 items-center gap-3 overflow-hidden rounded-2xl px-3 text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-cyan/70 ${
                    isActive || active
                      ? 'bg-[linear-gradient(135deg,rgba(37,99,235,0.28),rgba(6,182,212,0.16)_48%,rgba(124,58,237,0.18))] text-white shadow-[0_12px_28px_rgba(8,47,73,0.22)] ring-1 ring-cyan-300/25'
                      : 'text-slate-300 hover:translate-x-0.5 hover:bg-white/[0.065] hover:text-white'
                  }`
                }
              >
                <span
                  className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full transition ${
                    active ? 'bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.75)]' : 'bg-transparent'
                  }`}
                />
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.055),transparent)] opacity-0 transition duration-200 group-hover:opacity-100" />
                <span
                  className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition-all duration-200 ${
                    active
                      ? 'border-cyan-200/25 bg-cyan-300/18 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.16)]'
                      : 'border-white/5 bg-white/[0.045] text-slate-400 group-hover:border-cyan-200/20 group-hover:bg-cyan-300/10 group-hover:text-cyan-100'
                  }`}
                >
                  <Icon size={17} strokeWidth={2.15} />
                </span>
                <span className="relative truncate tracking-[0.01em]">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.aside
            aria-label="Menú principal"
            className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-hidden bg-[radial-gradient(circle_at_16%_0%,rgba(6,182,212,0.17),transparent_29%),radial-gradient(circle_at_88%_22%,rgba(124,58,237,0.13),transparent_34%),linear-gradient(180deg,#020617_0%,#07111f_48%,#0f172a_100%)] text-white shadow-2xl shadow-slate-950/30 ring-1 ring-white/10 lg:flex"
            initial={{ x: -288, opacity: 0.96 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -288, opacity: 0.96 }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
          >
            <SidebarContent onClose={onClose} compactClose />
          </motion.aside>

          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Cerrar menú lateral"
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menú principal"
              className="relative flex h-full w-[min(86vw,20rem)] flex-col overflow-hidden bg-[radial-gradient(circle_at_16%_0%,rgba(6,182,212,0.17),transparent_29%),radial-gradient(circle_at_88%_22%,rgba(124,58,237,0.13),transparent_34%),linear-gradient(180deg,#020617_0%,#07111f_48%,#0f172a_100%)] text-white shadow-2xl shadow-slate-950/60 ring-1 ring-white/10 sm:w-80"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            >
              <SidebarContent onClose={onClose} compactClose />
            </motion.aside>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
