import { useEffect, useState } from 'react';
import { PaymentTransaction, paymentsService } from '../services/payments.service';

export function PaymentStatusTable() {
  const [items, setItems] = useState<PaymentTransaction[]>([]);

  useEffect(() => {
    void paymentsService.transactions().then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <tbody>
          {items.length ? items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="px-4 py-3 font-bold">{item.provider}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">{item.currency} {Number(item.amount).toFixed(2)}</td>
              <td className="px-4 py-3 truncate">{item.paymentLink ?? 'Sin link'}</td>
            </tr>
          )) : <tr><td className="px-4 py-6 text-slate-500">No hay transacciones registradas.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
