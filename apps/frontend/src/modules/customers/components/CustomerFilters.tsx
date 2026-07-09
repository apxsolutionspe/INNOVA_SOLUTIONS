import { Plus, SlidersHorizontal } from 'lucide-react';

import { Button, FilterBar, SearchInput } from '../../../components/ui';
import { CustomerType } from '../types/customer.types';

interface CustomerFiltersProps {
  search: string;
  customerType: CustomerType | '';
  statusFilter: 'all' | 'active' | 'inactive';
  onSearchChange: (value: string) => void;
  onTypeChange: (value: CustomerType | '') => void;
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void;
  onCreate: () => void;
}

export function CustomerFilters({
  search,
  customerType,
  statusFilter,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onCreate,
}: CustomerFiltersProps) {
  return (
    <FilterBar
      actions={(
        <Button type="button" size="lg" onClick={onCreate}>
          <Plus size={18} />
          Nuevo cliente
        </Button>
      )}
    >
      <div className="grid w-full gap-3 lg:grid-cols-[minmax(16rem,1fr)_13rem_12rem]">
        <SearchInput
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, documento, teléfono o correo"
        />
        <label className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <select
            value={customerType}
            onChange={(event) => onTypeChange(event.target.value as CustomerType | '')}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
          >
            <option value="">Todos los tipos</option>
            <option value="NATURAL">Persona natural</option>
            <option value="COMPANY">Empresa</option>
          </select>
        </label>
        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value as 'all' | 'active' | 'inactive')}
          className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-blue-100"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </FilterBar>
  );
}
