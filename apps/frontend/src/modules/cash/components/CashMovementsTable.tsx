import { CashMovement, CashMovementType, PaymentMethod } from '../types/cash.types';
import { DataTable } from '../../../components/ui';

const typeLabels: Record<CashMovementType, string> = {
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  SALE: 'Venta',
  SERVICE_PAYMENT: 'Servicio',
  ADJUSTMENT: 'Ajuste',
};

const methodLabels: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFER: 'Transferencia',
  MIXED: 'Mixto',
};

function TypeBadge({ type }: { type: CashMovementType }) {
  const className = type === 'EXPENSE'
    ? 'bg-red-50 text-red-700 ring-red-100'
    : type === 'ADJUSTMENT'
      ? 'bg-orange-50 text-orange-700 ring-orange-100'
      : type === 'SALE'
        ? 'bg-blue-50 text-blue-700 ring-blue-100'
        : 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${className}`}>{typeLabels[type] ?? type}</span>;
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  const className = method === 'CASH'
    ? 'bg-emerald-50 text-emerald-700'
    : method === 'YAPE'
      ? 'bg-violet-50 text-violet-700'
      : method === 'PLIN'
        ? 'bg-cyan-50 text-cyan-700'
        : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${className}`}>{methodLabels[method] ?? method}</span>;
}

export function CashMovementsTable({ movements }: { movements: CashMovement[] }) {
  return (
    <DataTable
      items={movements}
      getRowKey={(movement) => movement.id}
      emptyTitle="No hay movimientos registrados en esta caja"
      emptyDescription="Los ingresos, gastos, ventas y servicios aparecerán aquí cuando se registren."
      maxHeight="clamp(380px,58vh,640px)"
      columns={[
        { key: 'date', header: 'Fecha/hora', cell: (movement) => new Date(movement.createdAt).toLocaleString('es-PE') },
        { key: 'type', header: 'Tipo', cell: (movement) => <TypeBadge type={movement.type} /> },
        { key: 'method', header: 'Método', cell: (movement) => <MethodBadge method={movement.paymentMethod} /> },
        {
          key: 'concept',
          header: 'Concepto',
          cell: (movement) => (
            <div>
              <p className="font-bold text-slate-900">{movement.concept}</p>
              {movement.reference ? <p className="mt-1 text-xs text-slate-500">Ref. {movement.reference}</p> : null}
            </div>
          ),
        },
        {
          key: 'amount',
          header: 'Monto',
          className: 'text-right',
          cell: (movement) => (
            <span className={movement.type === 'EXPENSE' ? 'font-black text-red-600' : 'font-black text-emerald-700'}>
              {movement.type === 'EXPENSE' ? '-' : '+'} S/ {movement.amount.toFixed(2)}
            </span>
          ),
        },
        { key: 'user', header: 'Usuario', cell: () => 'Sistema' },
        { key: 'status', header: 'Estado', cell: () => <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">Registrado</span> },
      ]}
    />
  );
}
