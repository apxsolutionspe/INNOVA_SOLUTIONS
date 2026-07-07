import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { paymentsService } from '../services/payments.service';

export function PaymentLinkForm() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState<'culqi' | 'izipay'>('culqi');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setResult('');
    setError('');
    try {
      const transaction = await paymentsService.createLink({ amount: Number(amount), description, provider });
      setResult(transaction.paymentLink ?? `Transaccion ${transaction.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el enlace.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[10rem_1fr_10rem_auto]">
        <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Monto" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
        <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción" className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue" />
        <select value={provider} onChange={(event) => setProvider(event.target.value as 'culqi' | 'izipay')} className="h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-blue">
          <option value="culqi">Culqi</option>
          <option value="izipay">Izipay</option>
        </select>
        <button type="button" onClick={() => void submit()} disabled={loading || !amount || !description.trim()} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
          <Link2 size={17} /> {loading ? 'Creando...' : 'Crear enlace'}
        </button>
      </div>
      {result ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{result}</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}

