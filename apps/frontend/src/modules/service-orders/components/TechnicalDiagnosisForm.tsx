import { FormEvent, useState } from 'react';

export function TechnicalDiagnosisForm({ onSubmit }: { onSubmit: (payload: { technicalDiagnosis: string; solutionApplied: string; laborCost: number; discount: number }) => Promise<void> }) {
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState('');
  const [solutionApplied, setSolutionApplied] = useState('');
  const [laborCost, setLaborCost] = useState(0);
  const [discount, setDiscount] = useState(0);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({ technicalDiagnosis, solutionApplied, laborCost, discount });
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Diagnostico y costos</h2>
      <div className="mt-4 grid gap-3">
        <textarea value={technicalDiagnosis} onChange={(event) => setTechnicalDiagnosis(event.target.value)} placeholder="Diagnostico tecnico" className="min-h-20 rounded-lg border px-3 py-2 text-sm" />
        <textarea value={solutionApplied} onChange={(event) => setSolutionApplied(event.target.value)} placeholder="Solucion aplicada" className="min-h-20 rounded-lg border px-3 py-2 text-sm" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="number" value={laborCost} onChange={(event) => setLaborCost(Number(event.target.value))} className="h-10 rounded-lg border px-3 text-sm" placeholder="Mano de obra" />
          <input type="number" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="h-10 rounded-lg border px-3 text-sm" placeholder="Descuento" />
        </div>
        <button className="h-10 rounded-lg bg-brand-violet px-4 text-sm font-bold text-white">Guardar diagnostico</button>
      </div>
    </form>
  );
}
