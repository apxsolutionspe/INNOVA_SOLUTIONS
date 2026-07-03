import { ChevronDown, LogOut, Menu, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { NotificationBell } from '../../modules/notifications/components/NotificationBell';
import { useAuthStore } from '../../store/auth.store';
import { getDisplayUserName, getRoleBadgeLabel, getRoleInitials } from '../../lib/rbac';
import { UserProfilePanel } from './UserProfilePanel';

interface HeaderProps {
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
  isMenuOpen?: boolean;
}

const routeTitles: Array<{ path: string; title: string }> = [
  { path: '/dashboard', title: 'Inicio' },
  { path: '/pos', title: 'POS' },
  { path: '/sales', title: 'Historial de ventas' },
  { path: '/quick-services', title: 'Servicios rápidos' },
  { path: '/quick-service-sales', title: 'Historial Servicios' },
  { path: '/payments', title: 'Pagos Online' },
  { path: '/customers', title: 'Clientes' },
  { path: '/inventory', title: 'Inventario' },
  { path: '/service-orders', title: 'Órdenes técnicas' },
  { path: '/cash', title: 'Caja' },
  { path: '/purchases', title: 'Compras' },
  { path: '/suppliers', title: 'Proveedores' },
  { path: '/reports', title: 'Reportes' },
  { path: '/profitability', title: 'Rentabilidad' },
  { path: '/ai-analytics', title: 'IA Analytics' },
  { path: '/users', title: 'Usuarios' },
  { path: '/audit', title: 'Auditoría' },
  { path: '/settings', title: 'Configuración' },
  { path: '/integrations', title: 'Integraciones' },
  { path: '/sunat', title: 'SUNAT' },
  { path: '/whatsapp', title: 'WhatsApp' },
  { path: '/ecommerce', title: 'eCommerce' },
];

function resolveRouteTitle(pathname: string) {
  return routeTitles.find((route) => pathname === route.path || pathname.startsWith(`${route.path}/`))?.title ?? 'Innova Solutions';
}

export function Header({ onMenuClick, onToggleSidebar, isMenuOpen = false }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const moduleTitle = resolveRouteTitle(location.pathname);
  const displayName = getDisplayUserName(user);
  const displayRole = getRoleBadgeLabel(user?.role);
  const initials = getRoleInitials(user?.role, user?.fullName);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 shadow-[0_10px_34px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(6,182,212,0.12),transparent_28%),linear-gradient(90deg,rgba(37,99,235,0.06),transparent_38%,rgba(124,58,237,0.055))]" />
      <div className="relative flex min-h-16 items-center justify-between gap-2 px-3 py-2 sm:min-h-20 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar ?? onMenuClick}
            aria-label={isMenuOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
            aria-expanded={isMenuOpen}
            className={`group grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-100 ${
              isMenuOpen
                ? 'border-cyan-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-violet-50 text-brand-blue shadow-cyan-100'
                : 'border-slate-200/80 bg-white/95 text-slate-700 hover:-translate-y-0.5 hover:border-brand-cyan hover:bg-cyan-50/70 hover:text-brand-blue hover:shadow-cyan-100/70'
            }`}
            title={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMenuOpen ? <PanelLeftOpen size={20} className="transition group-hover:scale-105" /> : <Menu size={20} className="transition group-hover:scale-105" />}
          </button>
          <div className="min-w-0">
            <p className="truncate text-base font-black tracking-tight text-slate-950 sm:text-xl">{moduleTitle}</p>
            <p className="hidden text-xs font-semibold text-slate-500 sm:block">
              Innova Solutions <span className="text-slate-300">/</span> Sistema Integral de Gestión
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <NotificationBell />
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="group hidden min-w-[15.5rem] max-w-[21rem] items-center gap-3 rounded-3xl border border-slate-200/80 bg-white/85 py-1.5 pl-1.5 pr-3.5 text-left shadow-sm shadow-slate-200/60 ring-1 ring-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white hover:shadow-lg hover:shadow-cyan-100/60 focus:outline-none focus:ring-4 focus:ring-cyan-100 md:flex"
            aria-label="Abrir perfil de usuario"
          >
            <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-500 text-sm font-black tracking-wide text-white shadow-md shadow-cyan-200/70 ring-1 ring-white/70">
              {initials}
              <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${user?.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate whitespace-nowrap text-[15px] font-black leading-5 text-slate-900">
                {displayName}
              </span>
              <span className="mt-1 flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                <span className="max-w-[8.5rem] truncate rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-brand-blue">{displayRole}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${user?.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {user?.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </span>
            </span>
            <ChevronDown size={16} className="shrink-0 text-slate-400 transition group-hover:translate-y-0.5 group-hover:text-brand-blue" />
          </button>
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="group grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white/90 text-sm font-black text-brand-blue shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-100 md:hidden"
            aria-label="Abrir perfil de usuario"
          >
            {initials}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="group inline-flex h-11 w-11 items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-0 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-red-100/70 focus:outline-none focus:ring-4 focus:ring-red-100 sm:w-auto sm:px-3"
          >
            <LogOut size={18} className="transition group-hover:translate-x-0.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      <UserProfilePanel user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  );
}
