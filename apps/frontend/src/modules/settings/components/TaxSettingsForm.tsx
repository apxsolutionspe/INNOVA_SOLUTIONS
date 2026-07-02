import { FormEvent, useEffect, useState } from 'react';
import { Percent, Save } from 'lucide-react';

import { settingsService } from '../services/settings.service';
import { TaxSettings } from '../types/settings.types';

export function TaxSettingsForm() {
  const [form, setForm] = useState<TaxSettings>({ applyIgv: false, taxPercentage: 18, igvRate: 0.18 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    settingsService.tax()
      .then((settings) => {
        if (isMounted) setForm(settings);
      })
      .catch(() => {
        if (isMounted) setError('No se pudo cargar la configuracion tributaria.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      const updated = await settingsService.updateTax({
        applyIgv: form.applyIgv,
        taxPercentage: form.taxPercentage,
      });
      setForm(updated);
      setMessage('Configuracion tributaria actualizada.');
    } catch {
      setError('No se pudo guardar la configuracion tributaria.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-700">
          <Percent size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-slate-950">Configuracion tributaria</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cuando el IGV esta desactivado, las ventas se calculan como exoneradas y el IGV sera S/ 0.00.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_14rem]">
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>
                <span className="block text-sm font-black text-slate-900">Aplicar IGV</span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  Estado: {form.applyIgv ? 'Activado' : 'Desactivado'}
                </span>
              </span>
              <button
                type="button"
                disabled={isLoading || isSaving}
                onClick={() => setForm((current) => ({ ...current, applyIgv: !current.applyIgv }))}
                className={`relative h-8 w-14 rounded-full transition ${
                  form.applyIgv ? 'bg-brand-blue' : 'bg-slate-300'
                } disabled:opacity-60`}
                aria-pressed={form.applyIgv}
                aria-label="Aplicar IGV"
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                    form.applyIgv ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-900">Tasa IGV (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                disabled={!form.applyIgv || isLoading || isSaving}
                value={form.taxPercentage}
                onChange={(event) => setForm((current) => ({ ...current, taxPercentage: Number(event.target.value) }))}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-brand-cyan focus:ring-4 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isLoading || isSaving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Save size={16} />
              {isSaving ? 'Guardando...' : 'Guardar configuracion'}
            </button>
            {message ? <span className="text-sm font-bold text-emerald-700">{message}</span> : null}
            {error ? <span className="text-sm font-bold text-red-700">{error}</span> : null}
          </div>
        </div>
      </div>
    </form>
  );
}
