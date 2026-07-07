import { Sale } from '../types/sale.types';
import { Button, DataTable, StatusBadge, TableActions } from '../../../components/ui';
import { formatPaymentMethod, formatStatusLabel } from '../../../utils/display-formatters';

interface SalesTableProps {
  sales: Sale[];
  isLoading: boolean;
  onDetail: (sale: Sale) => void;
  onCancel: (sale: Sale) => void;
  onReceipt: (sale: Sale) => void;
  canCancel: boolean;
}

function formatMoney(value: number) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function getPaidAmount(sale: Sale) {
  return sale.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
}

function getPaymentMethods(sale: Sale) {
  const methods = Array.from(new Set(sale.payments.map((payment) => payment.method)));
  if (!methods.length) return 'Sin pago';
  return methods.map(formatPaymentMethod).join(' / ');
}

export function SalesTable({ sales, isLoading, onDetail, onCancel, onReceipt, canCancel }: SalesTableProps) {
  return (
    <DataTable
      items={sales}
      isLoading={isLoading}
      getRowKey={(sale) => sale.id}
      emptyTitle="Aún no hay ventas registradas"
      emptyDescription="Las ventas confirmadas desde el POS aparecerán en este historial."
      columns={[
        {
          key: 'code',
          header: 'Comprobante',
          cell: (sale) => (
            <div>
              <span className="font-black text-slate-950">{sale.code}</span>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">{new Date(sale.createdAt).toLocaleString('es-PE')}</p>
            </div>
          ),
        },
        {
          key: 'customer',
          header: 'Cliente',
          cell: (sale) => (
            <div>
              <span className="font-semibold text-slate-800">{sale.customer?.fullName ?? 'Cliente general'}</span>
              <p className="mt-0.5 text-xs text-slate-400">{sale.user?.fullName ?? 'Usuario'}</p>
            </div>
          ),
        },
        {
          key: 'payment',
          header: 'Pago',
          cell: (sale) => (
            <div>
              <span className="font-bold text-slate-800">{getPaymentMethods(sale)}</span>
              <p className="mt-0.5 text-xs text-slate-400">{formatStatusLabel(sale.paymentStatus)}</p>
            </div>
          ),
        },
        {
          key: 'amounts',
          header: 'Importes',
          cell: (sale) => {
            const paid = getPaidAmount(sale);
            const pending = Math.max(sale.total - paid, 0);
            return (
              <div className="space-y-0.5">
                <p className="font-black text-slate-950">{formatMoney(sale.total)}</p>
                <p className="text-xs text-emerald-700">Pagado {formatMoney(paid)}</p>
                <p className={pending > 0 ? 'text-xs text-orange-600' : 'text-xs text-slate-400'}>Pendiente {formatMoney(pending)}</p>
              </div>
            );
          },
        },
        {
          key: 'tax',
          header: 'IGV',
          cell: (sale) => (
            <div>
              <span className="font-bold text-slate-800">{formatMoney(sale.taxTotal)}</span>
              <p className="mt-0.5 text-xs text-slate-400">{sale.applyIgv ? `${(sale.igvRate * 100).toFixed(2)}%` : 'Exonerado'}</p>
            </div>
          ),
        },
        { key: 'status', header: 'Estado', cell: (sale) => <StatusBadge status={sale.status} /> },
        {
          key: 'actions',
          header: 'Acciones',
          className: 'text-right',
          cell: (sale) => (
            <TableActions>
              <Button type="button" variant="secondary" size="sm" onClick={() => onDetail(sale)}>Ver</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onReceipt(sale)}>Comprobante</Button>
              {canCancel && sale.status === 'COMPLETED' ? <Button type="button" variant="danger" size="sm" onClick={() => onCancel(sale)}>Anular</Button> : null}
            </TableActions>
          ),
        },
      ]}
    />
  );
}
