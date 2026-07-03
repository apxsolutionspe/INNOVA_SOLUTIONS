import { Loader2, Send } from 'lucide-react';
import { FormEvent } from 'react';
import { AiSuggestionChips } from './AiSuggestionChips';

interface AiPromptBoxProps {
  question: string;
  loading: boolean;
  onQuestionChange: (value: string) => void;
  onAnalyze: (question?: string) => void;
}

export function AiPromptBox({ question, loading, onQuestionChange, onAnalyze }: AiPromptBoxProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAnalyze();
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-black text-slate-950">Pregunta sobre tu negocio</h2>
        <p className="mt-1 text-sm text-slate-500">Elige una sugerencia o escribe tu consulta.</p>
      </div>

      <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem]">
        <label className="sr-only" htmlFor="ai-business-question">Pregunta sobre tu negocio</label>
        <input
          id="ai-business-question"
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="Pregunta sobre tu negocio..."
          className="min-h-12 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-violet px-5 text-sm font-black text-white shadow-lg shadow-violet-100 transition hover:-translate-y-0.5 hover:shadow-violet-200 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={17} />}
          {loading ? 'Analizando...' : 'Analizar'}
        </button>
      </form>

      <div className="mt-5">
        <AiSuggestionChips onPick={onAnalyze} disabled={loading} />
      </div>
    </section>
  );
}
