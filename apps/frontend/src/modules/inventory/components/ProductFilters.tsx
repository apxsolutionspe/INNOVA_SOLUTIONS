import { ProductCategory } from '../types/inventory.types';

interface ProductFiltersProps {
  search: string;
  categoryId: string;
  categories: ProductCategory[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCreate: () => void;
  onCreateCategory: () => void;
}

export function ProductFilters({
  search,
  categoryId,
  categories,
  onSearchChange,
  onCategoryChange,
  onCreate,
  onCreateCategory,
}: ProductFiltersProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_220px_auto_auto]">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por nombre, SKU o categoria"
        className="h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-brand-cyan"
      />
      <select
        value={categoryId}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
      >
        <option value="">Todas las categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      <button onClick={onCreateCategory} className="h-11 rounded-lg border border-brand-cyan px-4 text-sm font-bold text-brand-blue">
        Nueva categoria
      </button>
      <button onClick={onCreate} className="h-11 rounded-lg bg-gradient-to-r from-brand-blue to-brand-violet px-5 text-sm font-bold text-white">
        Nuevo producto
      </button>
    </div>
  );
}
