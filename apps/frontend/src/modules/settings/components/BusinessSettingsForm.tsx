import { FormEvent, useEffect, useState } from 'react';
import { settingsService } from '../services/settings.service';
import { BusinessSettings } from '../types/settings.types';

export function BusinessSettingsForm() {
  const [form, setForm] = useState<Partial<BusinessSettings>>({});
  const [message, setMessage] = useState('');
  useEffect(() => { void settingsService.business().then(setForm); }, []);
  const update = (key: keyof BusinessSettings, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => { event.preventDefault(); setForm(await settingsService.updateBusiness(form)); setMessage('Configuracion actualizada.'); };
  return <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Datos del negocio</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><input value={form.businessName ?? ''} onChange={(e) => update('businessName', e.target.value)} placeholder="Nombre del negocio" className="h-11 rounded-lg border px-3 text-sm" /><input value={form.ruc ?? ''} onChange={(e) => update('ruc', e.target.value)} placeholder="RUC" className="h-11 rounded-lg border px-3 text-sm" /><input value={form.phone ?? ''} onChange={(e) => update('phone', e.target.value)} placeholder="Telefono" className="h-11 rounded-lg border px-3 text-sm" /><input value={form.email ?? ''} onChange={(e) => update('email', e.target.value)} placeholder="Correo" className="h-11 rounded-lg border px-3 text-sm" /><input value={form.address ?? ''} onChange={(e) => update('address', e.target.value)} placeholder="Direccion" className="h-11 rounded-lg border px-3 text-sm md:col-span-2" /></div>{message ? <p className="mt-3 text-sm font-bold text-emerald-700">{message}</p> : null}<button className="mt-4 h-11 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white">Guardar</button></form>;
}
