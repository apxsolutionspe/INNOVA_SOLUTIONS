import { LucideIcon } from 'lucide-react';

export type ReportTabId =
  | 'executive'
  | 'sales'
  | 'inventory'
  | 'service-orders'
  | 'quick-services'
  | 'purchases'
  | 'cash'
  | 'profitability';

interface ReportTab {
  id: ReportTabId;
  label: string;
  icon: LucideIcon;
}

interface ReportTabsProps {
  tabs: ReportTab[];
  activeTab: ReportTabId;
  onChange: (tab: ReportTabId) => void;
}

export function ReportTabs({ tabs, activeTab, onChange }: ReportTabsProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-black transition ${
              isActive
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <Icon size={17} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
