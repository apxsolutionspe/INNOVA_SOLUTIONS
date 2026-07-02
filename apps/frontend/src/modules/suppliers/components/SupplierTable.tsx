import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Button, DataTable, StatusBadge, TableActions } from '../../../components/ui';
import { Supplier } from '../types/supplier.types';

interface Props {
  suppliers: Supplier[];
  isLoading: boolean;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDeactivate: (supplier: Supplier) => void;
}

export function SupplierTable({ suppliers, isLoading, onView, onEdit, onDeactivate }: Props) {
  return (
    <DataTable
      items={suppliers}
      isLoading={isLoading}
      getRowKey={(supplier) => supplier.id}
      emptyTitle="No hay proveedores registrados"
      emptyDescription="Registra proveedores para compras y abastecimiento."
      columns={[
        { key: 'supplier', header: 'Proveedor', cell: (supplier) => <div><p className="font-black text-slate-900">{supplier.name}</p><p className="text-xs text-slate-500">{supplier.email || 'Sin correo'}</p></div> },
        { key: 'ruc', header: 'RUC', cell: (supplier) => supplier.ruc || '-' },
        { key: 'contact', header: 'Contacto', cell: (supplier) => supplier.phone || supplier.contactName || '-' },
        { key: 'status', header: 'Estado', cell: (supplier) => <StatusBadge status={supplier.isActive} /> },
        {
          key: 'actions',
          header: 'Acciones',
          className: 'text-right',
          cell: (supplier) => (
            <TableActions>
              <Button type="button" variant="secondary" size="sm" onClick={() => onView(supplier)}><Eye size={16} /> Ver</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(supplier)}><Pencil size={16} /> Editar</Button>
              <Button type="button" variant="danger" size="sm" onClick={() => onDeactivate(supplier)}><Trash2 size={16} /> Desactivar</Button>
            </TableActions>
          ),
        },
      ]}
    />
  );
}
