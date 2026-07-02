import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';

import { Supplier, SupplierPayload } from '../types/supplier.types';

interface Props {
  supplier?: Supplier | null;
  onSubmit: (payload: SupplierPayload) => Promise<void>;
  onClose: () => void;
}

export function SupplierForm({ supplier, onSubmit, onClose }: Props) {
  const [form, setForm] = useState<SupplierPayload>({
    name: supplier?.name ?? '',
    ruc: supplier?.ruc ?? '',
    phone: supplier?.phone ?? '',
    email: supplier?.email ?? '',
    address: supplier?.address ?? '',
    contactName: supplier?.contactName ?? '',
    notes: supplier?.notes ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const update = (key: keyof SupplierPayload, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit(form);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSubmit} className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{supplier ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
            <p className="text-sm text-slate-500">Datos comerciales para abastecimiento.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cerrar</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Nombre del proveedor" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
          <input value={form.ruc} onChange={(event) => update('ruc', event.target.value)} placeholder="RUC" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
          <input value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="Telefono" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
          <input value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="Correo" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
          <input value={form.contactName} onChange={(event) => update('contactName', event.target.value)} placeholder="Contacto principal" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
          <input value={form.address} onChange={(event) => update('address', event.target.value)} placeholder="Direccion" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
          <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Notas" className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-blue md:col-span-2" />
        </div>
        <button disabled={isSaving} type="submit" className="mt-5 h-11 w-full rounded-lg bg-brand-blue text-sm font-bold text-white disabled:opacity-60">
          {isSaving ? 'Guardando...' : 'Guardar proveedor'}
        </button>
      </motion.form>
    </div>
  );
}
