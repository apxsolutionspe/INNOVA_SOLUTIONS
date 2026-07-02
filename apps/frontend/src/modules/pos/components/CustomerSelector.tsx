import { UserRound } from 'lucide-react';

import { Customer } from '../../customers/types/customer.types';
import { getCustomerSelectLabel } from '../../customers/utils/customer-display';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}

export function CustomerSelector({ customers, selectedCustomer, onSelect }: CustomerSelectorProps) {
  return (
    <label className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <span className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
        <UserRound size={17} />
        Cliente
      </span>
      <p className="mt-1 text-xs font-semibold text-slate-500">
        Selecciona un cliente registrado o vende como cliente general.
      </p>
      <select
        value={selectedCustomer?.id ?? ''}
        onChange={(event) => onSelect(customers.find((customer) => customer.id === event.target.value) ?? null)}
        className="mt-3 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
      >
        <option value="">Cliente general</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>{getCustomerSelectLabel(customer)}</option>
        ))}
      </select>
    </label>
  );
}
