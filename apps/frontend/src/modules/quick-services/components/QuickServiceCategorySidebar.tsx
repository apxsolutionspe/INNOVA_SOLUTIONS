import { FileText, Layers, Palette, Repeat2, ScanLine, Search, Smartphone, Sparkles } from 'lucide-react';

import { QuickService, QuickServiceCategory } from '../types/quick-service.types';

interface QuickServiceCategorySidebarProps {
  categories: QuickServiceCategory[];
  services: QuickService[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
}

function iconForCategory(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes('impres')) return FileText;
  if (normalized.includes('foto')) return Repeat2;
  if (normalized.includes('scan') || normalized.includes('escaneo')) return ScanLine;
  if (normalized.includes('diseno') || normalized.includes('dise')) return Palette;
  if (normalized.includes('recarga')) return Smartphone;
  if (normalized.includes('tramite') || normalized.includes('tr')) return Search;
  return Sparkles;
}

function displayCategoryName(name: string) {
  const normalized = name.trim().replace(/\s+/g, ' ');
  const lower = normalized
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (lower.includes('tramite')) return 'Trámites digitales';
  if (lower.includes('diseno')) return 'Diseño';
  return normalized;
}

export function QuickServiceCategorySidebar({ categories, services, selectedCategoryId, onChange }: QuickServiceCategorySidebarProps) {
  const countByCategory = services.reduce<Record<string, number>>((accumulator, service) => {
    accumulator[service.categoryId] = (accumulator[service.categoryId] ?? 0) + 1;
    return accumulator;
  }, {});

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 px-1 text-xs font-black uppercase text-slate-500">
        <Layers size={15} />
        Categorías
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0">
        <button
          type="button"
          onClick={() => onChange('')}
          className={`flex h-10 shrink-0 items-center justify-between gap-3 rounded-xl px-3 text-left text-sm font-black transition xl:w-full ${
            !selectedCategoryId ? 'bg-slate-950 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span className="inline-flex items-center gap-2"><Sparkles size={16} /> Todas</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{services.length}</span>
        </button>
        {categories.map((category) => {
          const Icon = iconForCategory(category.name);
          const isActive = selectedCategoryId === category.id;
          const label = displayCategoryName(category.name);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.id)}
              className={`flex h-10 shrink-0 items-center justify-between gap-3 rounded-xl px-3 text-left text-sm font-black transition xl:w-full ${
                isActive ? 'bg-brand-blue text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="inline-flex min-w-0 items-center gap-2"><Icon className="shrink-0" size={16} /> <span className="truncate">{label}</span></span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{countByCategory[category.id] ?? 0}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

