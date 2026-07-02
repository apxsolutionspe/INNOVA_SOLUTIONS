import { Building2, Eye, Pencil, Power, UserRound } from 'lucide-react';

import { Button, DataTable, StatusBadge } from '../../../components/ui';
import { Customer } from '../types/customer.types';
import { getCustomerDisplayName, getCustomerTypeLabel } from '../utils/customer-display';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onStatusChange: (customer: Customer) => void;
}

function CustomerTypeBadge({ customer }: { customer: Customer }) {
  const isCompany = customer.customerType === 'COMPANY';
  const Icon = isCompany ? Building2 : UserRound;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ${
        isCompany ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-100' : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100'
      }`}
    >
      <Icon size={13} />
      {getCustomerTypeLabel(customer.customerType)}
    </span>
  );
}

const actionButtonClass =
  'h-9 w-9 shrink-0 rounded-xl p-0 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1';

export function CustomerTable({ customers, isLoading, onView, onEdit, onStatusChange }: CustomerTableProps) {
  return (
    <DataTable
      items={customers}
      isLoading={isLoading}
      getRowKey={(customer) => customer.id}
      emptyTitle="No hay clientes registrados"
      emptyDescription="Agrega personas o empresas para iniciar operaciones."
      columns={[
        {
          key: 'customer',
          header: 'Cliente',
          cell: (customer) => (
            <div className="min-w-0">
              <p className="font-black text-slate-900">{getCustomerDisplayName(customer)}</p>
              <p className="mt-1 text-xs text-slate-500">{customer.customerType === 'COMPANY' ? customer.tradeName || 'Sin nombre comercial' : customer.email || 'Sin correo'}</p>
            </div>
          ),
        },
        { key: 'type', header: 'Tipo', cell: (customer) => <CustomerTypeBadge customer={customer} /> },
        { key: 'document', header: 'Documento', cell: (customer) => `${customer.documentType} ${customer.documentNumber}` },
        { key: 'phone', header: 'Telefono', cell: (customer) => customer.phone || '-' },
        { key: 'email', header: 'Correo', cell: (customer) => customer.email || '-' },
        { key: 'status', header: 'Estado', cell: (customer) => <StatusBadge status={customer.isActive} /> },
        {
          key: 'actions',
          header: 'Acciones',
          className: 'w-[132px] min-w-[132px] text-right',
          cell: (customer) => (
            <div className="flex flex-nowrap items-center justify-end gap-1.5 whitespace-nowrap">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onView(customer)}
                className={`${actionButtonClass} border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-200`}
                aria-label="Ver cliente"
                title="Ver cliente"
              >
                <Eye size={16} aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onEdit(customer)}
                className={`${actionButtonClass} border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-200 hover:bg-blue-100 hover:text-blue-800 focus-visible:ring-blue-200`}
                aria-label="Editar cliente"
                title="Editar cliente"
              >
                <Pencil size={16} aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onStatusChange(customer)}
                className={
                  customer.isActive
                    ? `${actionButtonClass} border-red-100 bg-red-50 text-red-600 hover:border-red-200 hover:bg-red-100 hover:text-red-700 focus-visible:ring-red-200`
                    : `${actionButtonClass} border-emerald-100 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 focus-visible:ring-emerald-200`
                }
                aria-label={customer.isActive ? 'Desactivar cliente' : 'Activar cliente'}
                title={customer.isActive ? 'Desactivar cliente' : 'Activar cliente'}
              >
                <Power size={16} aria-hidden="true" />
              </Button>
            </div>
          ),
        },
      ]}
    />
  );
}
