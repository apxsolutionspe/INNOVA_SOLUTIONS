import { TableShell } from '../../../components/ui';
import { QuickServiceSale } from '../types/quick-service.types';

export function QuickServiceSalesTable({ sales, onReceipt, onCancel }: { sales: QuickServiceSale[]; onReceipt: (sale: QuickServiceSale) => void; onCancel: (sale: QuickServiceSale) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
      <TableShell maxHeight="clamp(320px,48vh,560px)" className="rounded-none border-0 shadow-none">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs uppercase text-slate-500 backdrop-blur">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="transition hover:bg-blue-50/35">
                <td className="px-4 py-3 font-bold">{sale.code}</td>
                <td className="px-4 py-3">{sale.customer?.fullName ?? 'Cliente general'}</td>
                <td className="px-4 py-3 font-bold">S/ {sale.total.toFixed(2)}</td>
                <td className="px-4 py-3">{sale.paymentMethod}</td>
                <td className="px-4 py-3">
                  <span className={sale.status === 'COMPLETED' ? 'font-bold text-emerald-700' : 'font-bold text-red-600'}>{sale.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => onReceipt(sale)} className="mr-2 rounded-lg border px-3 py-1">Comprobante</button>
                  {sale.status === 'COMPLETED' ? <button onClick={() => onCancel(sale)} className="rounded-lg border border-red-200 px-3 py-1 text-red-600">Cancelar</button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}
