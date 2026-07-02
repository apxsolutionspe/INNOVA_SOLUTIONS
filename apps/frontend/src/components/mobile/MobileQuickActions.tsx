import { Boxes, ReceiptText, Settings, ShoppingBag, Users, Zap } from 'lucide-react';
import { canAccessModule } from '../../lib/rbac';
import { useAuthStore } from '../../store/auth.store';
import { MobileModuleCard } from './MobileModuleCard';

const extraItems = [
  { label: 'Clientes', path: '/customers', icon: Users, moduleKey: 'customers' },
  { label: 'Inventario', path: '/inventory', icon: Boxes, moduleKey: 'inventory' },
  { label: 'Servicios rápidos', path: '/quick-services', icon: Zap, moduleKey: 'quick-services' },
  { label: 'Compras', path: '/purchases', icon: ShoppingBag, moduleKey: 'purchases' },
  { label: 'Reportes', path: '/reports', icon: ReceiptText, moduleKey: 'reports' },
  { label: 'Configuración', path: '/settings', icon: Settings, moduleKey: 'settings' },
];

export function MobileQuickActions({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((state) => state.user);
  const visibleItems = extraItems.filter((item) => canAccessModule(user, item.moduleKey));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 p-4 lg:hidden">
      <button type="button" className="absolute inset-0" onClick={onClose} title="Cerrar" />
      <div className="absolute bottom-20 left-4 right-4 rounded-lg bg-slate-50 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-bold text-slate-950">Más módulos</p>
          <button onClick={onClose} className="text-sm font-bold text-brand-blue">Cerrar</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleItems.map((item) => (
            <MobileModuleCard key={item.path} {...item} onClick={onClose} />
          ))}
        </div>
      </div>
    </div>
  );
}
