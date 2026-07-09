import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ListChecks, Sparkles } from 'lucide-react';
import { AiAnalysisResult, AiInsightResponse } from '../types/ai-analytics.types';
import { AiStatusBadge } from './AiStatusBadge';
import { AiTechnicalDetails } from './AiTechnicalDetails';

type ResultLike = AiAnalysisResult | (AiInsightResponse & { question?: string });

export function AiAnalysisResultCard({ result }: { result: ResultLike }) {
  const recommendations = 'recommendations' in result ? (result.recommendations ?? []) : [];
  const warnings = result.warnings ?? [];
  const paragraphs = formatAnswer(result.answer);
  const insightItems = result.insights.slice(0, 6);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70"
    >
      <div className="border-b border-slate-100 bg-gradient-to-br from-white to-violet-50/70 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-100 text-brand-violet">
                <Sparkles size={19} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">Resultado</h2>
                <p className="text-sm text-slate-500">Análisis generado con datos del sistema.</p>
              </div>
            </div>
            {'question' in result && result.question ? (
              <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-100">
                {result.question}
              </p>
            ) : null}
          </div>
          <AiStatusBadge provider={result.provider} mode={result.mode} />
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        {warnings.length ? (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            <AlertTriangle className="mt-0.5 shrink-0" size={17} />
            <span>{humanizeWarning(warnings[0])}</span>
          </div>
        ) : null}

        <section>
          <h3 className="text-sm font-black text-slate-950">Diagnóstico</h3>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        {recommendations.length ? (
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-emerald-800">
              <ListChecks size={17} />
              Acciones recomendadas
            </div>
            <ul className="grid gap-2">
              {recommendations.slice(0, 5).map((recommendation) => (
                <li key={recommendation} className="flex gap-2 text-sm leading-6 text-emerald-800">
                  <CheckCircle2 className="mt-1 shrink-0" size={15} />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {insightItems.length ? (
          <section>
            <h3 className="text-sm font-black text-slate-950">Hallazgos clave</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {insightItems.map((insight) => (
                <p key={insight} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  {insight}
                </p>
              ))}
            </div>
          </section>
        ) : null}

        <AiTechnicalDetails result={result} />
      </div>
    </motion.article>
  );
}

function formatAnswer(answer: string) {
  return answer
    .split(/\n+/)
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

function humanizeWarning(warning: string) {
  if (warning.toLowerCase().includes('gemini') || warning.toLowerCase().includes('openai')) {
    return 'Usando análisis interno del sistema.';
  }
  return warning;
}

