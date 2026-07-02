import { BusinessSettings } from '../types/settings.types';

export function ReceiptSettingsForm({ form, onChange }: { form: Partial<BusinessSettings>; onChange: (key: keyof BusinessSettings, value: string | number) => void }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold">Comprobantes</h2><div className="mt-4 grid gap-3"><input value={form.currency ?? 'PEN'} onChange={(e) => onChange('currency', e.target.value)} placeholder="Moneda" className="h-11 rounded-lg border px-3 text-sm" /><input type="number" value={form.taxPercentage ?? 18} onChange={(e) => onChange('taxPercentage', Number(e.target.value))} placeholder="IGV" className="h-11 rounded-lg border px-3 text-sm" /><textarea value={form.receiptMessage ?? ''} onChange={(e) => onChange('receiptMessage', e.target.value)} placeholder="Mensaje de comprobante" className="min-h-24 rounded-lg border px-3 py-2 text-sm" /></div></div>;
}
