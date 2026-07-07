import { Supplier } from '../types/supplier.types';

interface Props {
  supplier: Supplier;
  onClose: () => void;
}

export function SupplierDetailModal({ supplier, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{supplier.name}</h2>
            <p className="text-sm text-slate-500">{supplier.ruc || 'Sin RUC registrado'}</p>
          </div>
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cerrar</button>
        </div>
        <dl className="mt-5 grid gap-3 text-sm">
          {[
            ['Teléfono', supplier.phone],
            ['Correo', supplier.email],
            ['Contacto', supplier.contactName],
            ['Dirección', supplier.address],
            ['Notas', supplier.notes],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <dt className="text-xs font-bold uppercase text-slate-400">{label}</dt>
              <dd className="mt-1 font-semibold text-slate-800">{value || '-'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

