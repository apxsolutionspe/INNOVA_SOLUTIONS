import { Plus, Search } from 'lucide-react';
import { PurchaseOrderStatus } from '../types/purchase.types';

interface Props {
  search: string;
  status: PurchaseOrderStatus | '';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: PurchaseOrderStatus | '') => void;
  onCreate: () => void;
}

export function PurchaseOrderFilters({ search, status, onSearchChange, onStatusChange, onCreate }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <label className="relative flex-1">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar por código o proveedor" className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-brand-blue" />
      </label>
      <select value={status} onChange={(event) => onStatusChange(event.target.value as PurchaseOrderStatus | '')} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue">
        <option value="">Todos los estados</option>
        <option value="PENDING">Pendiente</option>
        <option value="PARTIALLY_RECEIVED">Recibida parcialmente</option>
        <option value="RECEIVED">Recibida completa</option>
        <option value="CANCELLED">Cancelada</option>
      </select>
      <button onClick={onCreate} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white hover:bg-blue-700"><Plus size={18} /> Nueva compra</button>
    </div>
  );
}

