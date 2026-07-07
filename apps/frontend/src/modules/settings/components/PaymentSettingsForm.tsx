import { BusinessSettings } from '../types/settings.types';

export function PaymentSettingsForm({ form, onChange }: { form: Partial<BusinessSettings>; onChange: (key: keyof BusinessSettings, value: string | number) => void }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Pagos</h2><div className="mt-4 grid gap-3"><input value={form.yapeNumber ?? ''} onChange={(e) => onChange('yapeNumber', e.target.value)} placeholder="Número Yape" className="h-11 rounded-lg border px-3 text-sm" /><input value={form.plinNumber ?? ''} onChange={(e) => onChange('plinNumber', e.target.value)} placeholder="Número Plin" className="h-11 rounded-lg border px-3 text-sm" /><input value={form.bankAccount ?? ''} onChange={(e) => onChange('bankAccount', e.target.value)} placeholder="Cuenta bancaria" className="h-11 rounded-lg border px-3 text-sm" /></div></div>;
}

