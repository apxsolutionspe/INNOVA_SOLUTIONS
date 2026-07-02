import { useState } from 'react';
import { aiAnalyticsService } from '../services/ai-analytics.service';
import { AiAnalysisResult, AiIndexStatus, AiInsightResponse, AiLocalHealth } from '../types/ai-analytics.types';

export function useAiAnalytics() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [panelResult, setPanelResult] = useState<AiInsightResponse | null>(null);
  const [health, setHealth] = useState<AiLocalHealth | null>(null);
  const [indexStatus, setIndexStatus] = useState<AiIndexStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelLoading, setPanelLoading] = useState('');
  const [rebuilding, setRebuilding] = useState(false);
  const [error, setError] = useState('');

  async function loadLocalStatus() {
    setError('');
    try {
      const [healthData, indexData] = await Promise.all([
        aiAnalyticsService.localHealth(),
        aiAnalyticsService.localIndexStatus().catch(() => null),
      ]);
      setHealth(healthData);
      setIndexStatus(indexData);
    } catch (err) {
      setHealth({ status: 'error', service: 'innova-ai-service', ollama: 'disconnected', model: 'qwen3', rag: false });
      setError(err instanceof Error ? err.message : 'IA local no disponible. Verifica que Ollama esté ejecutándose.');
    }
  }

  async function analyze(nextQuestion = question) {
    const cleanQuestion = nextQuestion.trim();
    if (!cleanQuestion) {
      setError('Escribe una pregunta para analizar.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setQuestion(cleanQuestion);
      setResult(await aiAnalyticsService.localAsk(cleanQuestion, true));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'IA local no disponible. Verifica que Ollama esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  }

  async function runPanel(type: 'sales' | 'inventory' | 'profitability') {
    setPanelLoading(type);
    setError('');
    setPanelResult(null);
    try {
      const response =
        type === 'sales'
          ? await aiAnalyticsService.salesInsights()
          : type === 'inventory'
            ? await aiAnalyticsService.inventoryInsights()
            : await aiAnalyticsService.profitabilityInsights();
      setPanelResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el análisis.');
    } finally {
      setPanelLoading('');
    }
  }

  async function rebuildIndex() {
    setRebuilding(true);
    setError('');
    try {
      setIndexStatus(await aiAnalyticsService.rebuildIndex());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reconstruir el índice RAG.');
    } finally {
      setRebuilding(false);
    }
  }

  return {
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
  };
}
