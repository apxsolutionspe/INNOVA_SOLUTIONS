import { Boxes } from 'lucide-react';

import { ProductCategory } from '../../inventory/types/inventory.types';

interface ProductCategoryFilterProps {
  categories: ProductCategory[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
}

export function ProductCategoryFilter({ categories, selectedCategoryId, onChange }: ProductCategoryFilterProps) {
  if (!categories.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-slate-500">
        <Boxes size={15} />
        Categorias
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onChange('')}
          className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-black transition ${
            !selectedCategoryId
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className={`inline-flex h-9 max-w-48 shrink-0 items-center rounded-full px-3 text-xs font-black transition ${
              selectedCategoryId === category.id
                ? 'bg-brand-blue text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title={category.name}
          >
            <span className="truncate">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
