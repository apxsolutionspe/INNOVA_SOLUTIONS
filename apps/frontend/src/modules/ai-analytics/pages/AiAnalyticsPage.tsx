import { useEffect } from 'react';
import { Brain, Cloud, Database, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { useAuthStore } from '../../../store/auth.store';
import { ExecutiveHeader } from '../../business-intelligence/components/ExecutiveHeader';
import { ExecutiveKpiCard } from '../../business-intelligence/components/ExecutiveKpiCard';
import { ExecutivePanel } from '../../business-intelligence/components/ExecutivePanel';
import { ModeBadge } from '../../business-intelligence/components/ModeBadge';
import { AiAnalysisResultCard } from '../components/AiAnalysisResultCard';
import { AiInsightCard } from '../components/AiInsightCard';
import { AiQuestionBox } from '../components/AiQuestionBox';
import { AiRebuildIndexPanel } from '../components/AiRebuildIndexPanel';
import { useAiAnalytics } from '../hooks/useAiAnalytics';

export function AiAnalyticsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role.name === 'ADMIN';
  const {
    question,
    setQuestion,
    result,
    panelResult,
    connectionStatus,
    health,
    indexStatus,
    loading,
    panelLoading,
    rebuilding,
    error,
    analyze,
    runPanel,
    loadConnectionStatus,
    loadLocalStatus,
    rebuildIndex,
  } = useAiAnalytics();

  const activeMode = result?.mode ?? panelResult?.mode ?? connectionStatus?.mode ?? 'RULE_BASED_FALLBACK';
  const provider = result?.provider ?? panelResult?.provider ?? connectionStatus?.provider ?? 'RULE_BASED';
  const model = result?.model ?? connectionStatus?.model ?? 'gpt-4.1-mini';
  const cloudConnected = provider === 'OPENAI' && activeMode === 'CLOUD_AI';
  const cloudConfigured = connectionStatus?.keyConfigured ?? false;
  const localAvailable = health?.ollama === 'connected';

  useEffect(() => {
    void loadConnectionStatus();
    if (isAdmin) void loadLocalStatus();
  }, [isAdmin]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <ExecutiveHeader
        eyebrow="IA empresarial cloud"
        title="IA Analytics"
        description="Analiza ventas, inventario, caja, compras y rentabilidad con datos agregados del backend. OpenAI se usa solo desde NestJS y el sistema conserva fallback interno si no hay credenciales."
        meta="No se envian passwords, tokens, JWT, DATABASE_URL ni datos sensibles al proveedor IA."
        actions={
          <div className="flex flex-wrap gap-2">
            <ModeBadge
              label={cloudConnected ? 'IA Cloud conectada' : cloudConfigured ? 'IA Cloud en validacion' : 'Analisis interno activo'}
              tone={cloudConnected ? 'real' : cloudConfigured ? 'sandbox' : 'mock'}
            />
            <button
              type="button"
              onClick={() => void loadConnectionStatus()}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw size={14} />
              Probar conexion
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ExecutiveKpiCard
          title="Proveedor"
          value={provider === 'OPENAI' ? 'OpenAI' : 'Interno'}
          description={cloudConnected ? 'Proveedor cloud conectado' : 'Fallback basado en reglas y estadisticas'}
          icon={cloudConnected ? Cloud : Brain}
          tone={cloudConnected ? 'green' : 'violet'}
        />
        <ExecutiveKpiCard
          title="Modelo"
          value={model}
          description={cloudConfigured ? 'Key configurada en backend' : 'Sin key cloud configurada'}
          icon={Sparkles}
          tone={cloudConfigured ? 'blue' : 'orange'}
        />
        <ExecutiveKpiCard
          title="Modo actual"
          value={activeMode}
          description={activeMode === 'CLOUD_AI' ? 'Respuesta cloud con datos agregados' : 'Respuesta interna segura'}
          icon={ShieldCheck}
          tone={activeMode === 'CLOUD_AI' ? 'green' : 'orange'}
        />
      </div>

      {connectionStatus?.warnings?.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {connectionStatus.warnings[0]}
        </div>
      ) : null}

      <AiQuestionBox question={question} onQuestionChange={setQuestion} onAnalyze={(nextQuestion) => void analyze(nextQuestion)} loading={loading} />
      {error ? <ErrorState message={error} /> : null}
      {result ? <AiAnalysisResultCard result={result} /> : null}
      {panelResult ? <AiAnalysisResultCard result={panelResult} /> : null}
      {!result && !panelResult && !loading ? (
        <EmptyState
          title="Listo para analizar"
          description="Escribe una pregunta o usa una accion rapida. Si OpenAI no esta configurado, el sistema responde con analisis interno basado en datos reales."
          icon={RefreshCw}
        />
      ) : null}

      <ExecutivePanel title="Analisis por modulo" description="Acciones rapidas conectadas a endpoints especializados del backend.">
        <div className="grid gap-5 lg:grid-cols-3">
          <AiInsightCard title="Ventas" actionLabel="Analizar ventas" onAction={() => void runPanel('sales')} loading={panelLoading === 'sales'} items={['Productos con mayor demanda.', 'Ingresos del mes.', 'Ventas recientes por metodo de pago.']} />
          <AiInsightCard title="Inventario" actionLabel="Analizar inventario" onAction={() => void runPanel('inventory')} loading={panelLoading === 'inventory'} items={['Stock bajo y sin stock.', 'Posible baja rotacion.', 'Movimientos recientes.']} />
          <AiInsightCard title="Rentabilidad" actionLabel="Analizar rentabilidad" onAction={() => void runPanel('profitability')} loading={panelLoading === 'profitability'} items={['Margen por producto.', 'Servicios con mejor margen.', 'Gastos registrados.']} />
        </div>
      </ExecutivePanel>

      {isAdmin && localAvailable ? (
        <ExecutivePanel title="IA local opcional" description="Modo local disponible solo como respaldo operativo en entornos donde Ollama/RAG exista.">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                <Database size={17} />
                Ollama conectado
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Modelo local: {health?.model ?? 'qwen3'}. RAG: {health?.rag ? 'activo' : 'inactivo'}.
              </p>
            </div>
            <AiRebuildIndexPanel status={indexStatus} rebuilding={rebuilding} onRebuild={() => void rebuildIndex()} />
          </div>
        </ExecutivePanel>
      ) : null}
    </section>
  );
}
