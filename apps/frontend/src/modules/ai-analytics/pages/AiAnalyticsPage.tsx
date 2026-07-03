import { useEffect } from 'react';
import { BarChart3, Boxes, DollarSign, RefreshCw, type LucideIcon } from 'lucide-react';

import { AiAnalysisResultCard } from '../components/AiAnalysisResultCard';
import { AiEmptyState } from '../components/AiEmptyState';
import { AiErrorNotice } from '../components/AiErrorNotice';
import { AiLoadingState } from '../components/AiLoadingState';
import { AiPromptBox } from '../components/AiPromptBox';
import { AiStatusBadge } from '../components/AiStatusBadge';
import { AiTechnicalDetails } from '../components/AiTechnicalDetails';
import { useAiAnalytics } from '../hooks/useAiAnalytics';

export function AiAnalyticsPage() {
  const {
    question,
    setQuestion,
    result,
    panelResult,
    connectionStatus,
    loading,
    panelLoading,
    error,
    analyze,
    runPanel,
    loadConnectionStatus,
  } = useAiAnalytics();

  const currentResult = result ?? panelResult;
  const provider = currentResult?.provider ?? connectionStatus?.provider ?? 'RULE_BASED';
  const mode = currentResult?.mode ?? connectionStatus?.mode ?? 'RULE_BASED_FALLBACK';

  useEffect(() => {
    void loadConnectionStatus();
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <header className="rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm shadow-slate-200/70 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">IA Analytics</h1>
              <AiStatusBadge provider={provider} mode={mode} />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Analiza ventas, inventario, caja y rentabilidad con datos reales.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadConnectionStatus()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-100"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>
      </header>

      <AiPromptBox question={question} onQuestionChange={setQuestion} onAnalyze={(nextQuestion) => void analyze(nextQuestion)} loading={loading} />

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickAction title="Ventas" description="Demanda e ingresos" icon={BarChart3} loading={panelLoading === 'sales'} onClick={() => void runPanel('sales')} />
        <QuickAction title="Inventario" description="Reposicion y stock" icon={Boxes} loading={panelLoading === 'inventory'} onClick={() => void runPanel('inventory')} />
        <QuickAction title="Rentabilidad" description="Margen y utilidad" icon={DollarSign} loading={panelLoading === 'profitability'} onClick={() => void runPanel('profitability')} />
      </div>

      {loading ? <AiLoadingState /> : null}
      {error ? <AiErrorNotice message={error} /> : null}
      {currentResult ? <AiAnalysisResultCard result={currentResult} /> : null}
      {!currentResult && !loading && !error ? <AiEmptyState /> : null}

      {!currentResult ? <AiTechnicalDetails status={connectionStatus} /> : null}
    </section>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  loading: boolean;
  onClick: () => void;
}

function QuickAction({ title, description, icon: Icon, loading, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group flex min-h-24 items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/50 focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600 transition group-hover:bg-violet-100 group-hover:text-brand-violet">
        <Icon size={20} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-slate-950">{loading ? 'Analizando...' : title}</span>
        <span className="mt-1 block text-sm text-slate-500">{description}</span>
      </span>
    </button>
  );
}
