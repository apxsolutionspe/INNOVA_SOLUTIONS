import { useMemo, useState } from 'react';
import { Eye, ReceiptText, Search, XCircle } from 'lucide-react';

import { TableShell } from '../../../components/ui';
import { formatPaymentMethod, formatStatusLabel } from '../../../utils/display-formatters';
import { PaymentMethod, QuickServiceSale, QuickServiceSaleStatus } from '../types/quick-service.types';
import { QuickServiceEmptyState } from './QuickServiceEmptyState';

interface QuickServiceSalesHistoryProps {
  sales: QuickServiceSale[];
  isAdmin: boolean;
  onReceipt: (sale: QuickServiceSale) => void;
  onCancel: (sale: QuickServiceSale) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function QuickServiceSalesHistory({ sales, isAdmin, onReceipt, onCancel }: QuickServiceSalesHistoryProps) {
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sales.filter((sale) => {
      const matchesSearch = !query || sale.code.toLowerCase().includes(query) || (sale.customer?.fullName ?? 'cliente general').toLowerCase().includes(query) || sale.items.some((item) => item.description.toLowerCase().includes(query));
      const matchesPayment = !paymentMethod || sale.paymentMethod === paymentMethod;
      const matchesStatus = !status || sale.status === status;
      const matchesDate = !date || sale.createdAt.slice(0, 10) === date;
      return matchesSearch && matchesPayment && matchesStatus && matchesDate;
    });
  }, [date, paymentMethod, sales, search, status]);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código, cliente o servicio"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100" />
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100">
            <option value="">Todos los pagos</option>
            {(['CASH', 'YAPE', 'PLIN', 'TRANSFER'] as PaymentMethod[]).map((method) => <option key={method} value={method}>{formatPaymentMethod(method)}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-brand-cyan focus:bg-white focus:ring-4 focus:ring-cyan-100">
            <option value="">Todos los estados</option>
            {(['COMPLETED', 'CANCELLED'] as QuickServiceSaleStatus[]).map((item) => <option key={item} value={item}>{formatStatusLabel(item)}</option>)}
          </select>
        </div>
      </div>

      {!filteredSales.length ? (
        <QuickServiceEmptyState title="No hay operaciones para mostrar" description="Ajusta los filtros o registra una nueva operación rápida." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          <TableShell maxHeight="clamp(360px,52vh,620px)" className="rounded-none border-0 shadow-none">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs font-black uppercase text-slate-500 backdrop-blur">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Servicios</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="align-top transition hover:bg-blue-50/35">
                    <td className="px-4 py-3 font-black text-slate-950">{sale.code}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-700">{sale.customer?.fullName ?? 'Cliente general'}</td>
                    <td className="px-4 py-3 text-slate-600">{sale.items.map((item) => item.description).slice(0, 2).join(', ')}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{formatPaymentMethod(sale.paymentMethod)}</td>
                    <td className="px-4 py-3 font-black text-slate-950">S/ {sale.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${sale.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {formatStatusLabel(sale.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => onReceipt(sale)} className="mr-2 inline-flex h-9 items-center gap-1.5 rounded-lg border border-cyan-100 px-3 text-xs font-black text-brand-blue">
                        <ReceiptText size={15} />
                        Comprobante
                      </button>
                      <button type="button" onClick={() => onReceipt(sale)} className="mr-2 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-600">
                        <Eye size={15} />
                        Detalle
                      </button>
                      {isAdmin && sale.status === 'COMPLETED' ? (
                        <button type="button" onClick={() => onCancel(sale)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-100 px-3 text-xs font-black text-red-600">
                          <XCircle size={15} />
                          Cancelar
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      )}
    </section>
  );
}
