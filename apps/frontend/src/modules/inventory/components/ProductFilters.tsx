import { ProductCategory } from '../types/inventory.types';

interface ProductFiltersProps {
  search: string;
  categoryId: string;
  categories: ProductCategory[];
  resultCount: number;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCreate: () => void;
  onCreateCategory: () => void;
}

export function ProductFilters({
  search,
  categoryId,
  categories,
  resultCount,
  onSearchChange,
  onCategoryChange,
  onCreate,
  onCreateCategory,
}: ProductFiltersProps) {
  const resultLabel = resultCount === 1 ? '1 producto encontrado' : `${resultCount} productos encontrados`;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, SKU o categoria"
          className="h-11 rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100"
        />
        <select
          value={categoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100"
        >
          <option value="">Todas las categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <button onClick={onCreateCategory} className="h-11 rounded-lg border border-brand-cyan px-4 text-sm font-bold text-brand-blue transition hover:bg-cyan-50">
          Nueva categoria
        </button>
        <button onClick={onCreate} className="h-11 rounded-lg bg-gradient-to-r from-brand-blue to-brand-violet px-5 text-sm font-bold text-white shadow-sm transition hover:shadow-md">
          Nuevo producto
        </button>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{resultLabel}</p>
    </div>
  );
}
