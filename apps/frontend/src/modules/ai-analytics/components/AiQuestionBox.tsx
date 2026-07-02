import { Brain, Send } from 'lucide-react';

const quickQuestions = [
  'Que productos debo reponer?',
  'Que productos tienen baja rotacion?',
  'Cuales son los productos mas vendidos?',
  'Que servicios generan mas ingresos?',
  'Como mejorar la rentabilidad?',
  'Que alertas importantes hay hoy?',
  'Como esta la caja?',
  'Que compras debo revisar?',
];

export function AiQuestionBox({
  question,
  onQuestionChange,
  onAnalyze,
  loading,
}: {
  question: string;
  onQuestionChange: (value: string) => void;
  onAnalyze: (question?: string) => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-50 text-brand-violet">
          <Brain size={20} />
        </div>
        <div>
          <h2 className="font-black text-slate-950">Pregunta empresarial</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Consulta ventas, inventario, caja, compras y rentabilidad con datos reales del sistema.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onAnalyze();
          }}
          placeholder="Ej. Que productos debo reponer?"
          className="h-11 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-violet focus:ring-4 focus:ring-violet-100"
        />
        <button disabled={loading} onClick={() => onAnalyze()} className="h-11 rounded-lg bg-brand-violet px-5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
          <span className="inline-flex items-center gap-2"><Send size={16} /> {loading ? 'Analizando...' : 'Analizar'}</span>
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {quickQuestions.map((item) => (
          <button key={item} type="button" onClick={() => onAnalyze(item)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-violet hover:bg-violet-50 hover:text-brand-violet">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
