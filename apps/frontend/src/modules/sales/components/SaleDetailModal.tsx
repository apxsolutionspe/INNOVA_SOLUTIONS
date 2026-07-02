import { Sale } from '../types/sale.types';

interface SaleDetailModalProps {
  sale: Sale;
  onClose: () => void;
}

export function SaleDetailModal({ sale, onClose }: SaleDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-slate-950">{sale.code}</h2>
        <p className="mt-1 text-sm text-slate-500">{sale.customer?.fullName ?? 'Cliente general'}</p>
        <div className="mt-5 space-y-2">
          {sale.items.map((item) => (
            <div key={item.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span>{item.description} x {item.quantity}</span>
              <strong>S/ {item.total.toFixed(2)}</strong>
            </div>
          ))}
        </div>
        <p className="mt-5 text-right text-2xl font-black text-emerald-700">S/ {sale.total.toFixed(2)}</p>
        <button onClick={onClose} className="mt-5 h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white">Cerrar</button>
      </div>
    </div>
  );
}
