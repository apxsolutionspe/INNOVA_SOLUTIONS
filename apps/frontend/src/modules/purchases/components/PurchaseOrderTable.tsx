import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

import { TableShell } from '../../../components/ui';
import { PurchaseStatusBadge } from './PurchaseStatusBadge';
import { PurchaseOrder } from '../types/purchase.types';

export function PurchaseOrderTable({ purchases, isLoading }: { purchases: PurchaseOrder[]; isLoading: boolean }) {
  if (isLoading) return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-500">Cargando compras...</div>;
  if (!purchases.length) return <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">No hay compras registradas.</div>;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <TableShell maxHeight="clamp(360px,52vh,620px)" className="rounded-none border-0 shadow-none">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs font-bold uppercase text-slate-500 backdrop-blur">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Proveedor</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 text-right">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="transition hover:bg-blue-50/35">
                <td className="px-4 py-3 font-bold text-slate-900">{purchase.code}</td>
                <td className="px-4 py-3 text-slate-600">{purchase.supplier.name}</td>
                <td className="px-4 py-3"><PurchaseStatusBadge status={purchase.status} /></td>
                <td className="px-4 py-3 text-slate-600">{purchase.paymentStatus}</td>
                <td className="px-4 py-3 font-bold text-slate-900">S/ {purchase.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-right"><Link to={`/purchases/${purchase.id}`} className="inline-flex rounded-lg p-2 text-brand-blue hover:bg-blue-50" title="Ver detalle"><Eye size={18} /></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}
