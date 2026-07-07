import { History, Settings, ShoppingBasket } from 'lucide-react';

import { QuickServicesTab } from '../types/quick-service-ui.types';

interface QuickServicesTabsProps {
  activeTab: QuickServicesTab;
  isAdmin: boolean;
  onChange: (tab: QuickServicesTab) => void;
}

export function QuickServicesTabs({ activeTab, isAdmin, onChange }: QuickServicesTabsProps) {
  const tabs = [
    { id: 'operation' as const, label: 'Operación rápida', icon: ShoppingBasket, visible: true },
    { id: 'admin' as const, label: 'Administracion', icon: Settings, visible: isAdmin },
    { id: 'history' as const, label: 'Historial', icon: History, visible: true },
  ].filter((tab) => tab.visible);

  return (
    <div className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm [scrollbar-width:thin]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black transition ${
              isActive ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            <Icon size={17} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

