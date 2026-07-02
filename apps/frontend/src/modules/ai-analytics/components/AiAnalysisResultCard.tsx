import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { ModeBadge } from '../../business-intelligence/components/ModeBadge';
import { AiAnalysisResult, AiInsightResponse } from '../types/ai-analytics.types';
import { AiSourcesPanel } from './AiSourcesPanel';

export function AiAnalysisResultCard({ result }: { result: AiAnalysisResult | AiInsightResponse & { question?: string } }) {
  const isReal = result.mode === 'REAL';
  const recommendations = 'recommendations' in result ? (result.recommendations ?? []) : [];
  const sources = 'sources' in result ? (result.sources ?? []) : [];
  const model = 'model' in result ? result.model : undefined;
  return (
    <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-brand-violet">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">Resultado del análisis</h2>
            <p className="mt-1 text-sm text-slate-500">Respuesta generada desde datos agregados del sistema.</p>
          </div>
        </div>
        <ModeBadge label={`${model ? `${model} / ` : ''}${result.mode}`} tone={isReal || result.mode === 'LOCAL_RAG' ? 'real' : 'mock'} />
      </div>
      {'question' in result && result.question ? (
        <div className="mt-4 rounded-lg border border-violet-100 bg-violet-50 px-3 py-3">
          <p className="text-xs font-black uppercase text-violet-500">Pregunta</p>
          {'question' in result && result.question ? <p className="mt-1 text-sm font-semibold text-brand-violet">{result.question}</p> : null}
        </div>
      ) : null}
      <p className="mt-4 text-sm leading-6 text-slate-700">{result.answer}</p>
      {result.insights.length ? (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {result.insights.map((insight) => (
            <p key={insight} className="flex gap-2 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-500" />
              <span>{insight}</span>
            </p>
          ))}
        </div>
      ) : <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Aún no hay suficientes datos para generar un análisis completo.</p>}
      {recommendations.length ? (
        <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-black text-emerald-800">Recomendaciones accionables</p>
          <div className="mt-3 grid gap-2">
            {recommendations.map((recommendation) => (
              <p key={recommendation} className="text-sm leading-6 text-emerald-800">{recommendation}</p>
            ))}
          </div>
        </div>
      ) : null}
      <AiSourcesPanel sources={sources} />
      <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-400"><Clock size={14} /> Analizado: {new Date(result.generatedAt).toLocaleString()}</p>
    </motion.article>
  );
}
