import { useEffect } from 'react';
import { Brain, Database, RefreshCw, Sparkles, TrendingUp, WifiOff } from 'lucide-react';

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
    health,
    indexStatus,
    loading,
    panelLoading,
    rebuilding,
    error,
    analyze,
    runPanel,
    loadLocalStatus,
    rebuildIndex,
  } = useAiAnalytics();
  const activeMode = result?.mode ?? panelResult?.mode ?? (health?.ollama === 'connected' ? 'LOCAL' : 'LOCAL_FALLBACK');
  const isConnected = health?.ollama === 'connected';

  useEffect(() => {
    void loadLocalStatus();
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      <ExecutiveHeader
        eyebrow="IA local privada"
        title="IA Analytics"
        description="Analiza tu negocio con Ollama, ChromaDB y RAG a través de NestJS. El frontend nunca llama directamente al microservicio IA."
        meta="Datos agregados, sin passwords, tokens ni información personal innecesaria."
        actions={<ModeBadge label={isConnected ? `Ollama conectado / ${health?.model ?? 'qwen3'}` : 'IA local desconectada'} tone={isConnected ? 'real' : 'error'} />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ExecutiveKpiCard title="Ollama" value={isConnected ? 'Conectado' : 'Desconectado'} description={health?.model ?? 'qwen3'} icon={isConnected ? Brain : WifiOff} tone={isConnected ? 'green' : 'red'} />
        <ExecutiveKpiCard title="RAG" value={health?.rag ? 'Activo' : 'Inactivo'} description={`${indexStatus?.documents ?? 0} documentos indexados`} icon={Database} tone={health?.rag ? 'violet' : 'orange'} />
        <ExecutiveKpiCard title="Modo actual" value={activeMode} description="Local, RAG o fallback" icon={Sparkles} tone={activeMode === 'LOCAL_RAG' ? 'green' : 'violet'} />
      </div>

      <AiQuestionBox question={question} onQuestionChange={setQuestion} onAnalyze={(nextQuestion) => void analyze(nextQuestion)} loading={loading} />
      {error ? <ErrorState message={error} /> : null}
      {result ? <AiAnalysisResultCard result={result} /> : null}
      {panelResult ? <AiAnalysisResultCard result={panelResult} /> : null}
      {!result && !panelResult && !loading ? <EmptyState title="Listo para analizar" description="Escribe una pregunta o usa una acción rápida para generar un análisis profesional del negocio." icon={RefreshCw} /> : null}
      <ExecutivePanel title="Análisis por módulo" description="Acciones rápidas conectadas a endpoints especializados.">
        <div className="grid gap-5 lg:grid-cols-3">
          <AiInsightCard title="Ventas" actionLabel="Analizar ventas" onAction={() => void runPanel('sales')} loading={panelLoading === 'sales'} items={['Productos con mayor demanda.', 'Ingresos del mes.', 'Ventas recientes por método de pago.']} />
          <AiInsightCard title="Inventario" actionLabel="Analizar inventario" onAction={() => void runPanel('inventory')} loading={panelLoading === 'inventory'} items={['Stock bajo y sin stock.', 'Posible baja rotación.', 'Movimientos recientes.']} />
          <AiInsightCard title="Rentabilidad" actionLabel="Analizar rentabilidad" onAction={() => void runPanel('profitability')} loading={panelLoading === 'profitability'} items={['Margen por producto.', 'Servicios con mejor margen.', 'Gastos registrados.']} />
        </div>
      </ExecutivePanel>
      {isAdmin ? <AiRebuildIndexPanel status={indexStatus} rebuilding={rebuilding} onRebuild={() => void rebuildIndex()} /> : null}
    </section>
  );
}
