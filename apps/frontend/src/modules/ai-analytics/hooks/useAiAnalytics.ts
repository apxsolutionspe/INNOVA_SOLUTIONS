import { useState } from 'react';

import { aiAnalyticsService } from '../services/ai-analytics.service';
import {
  AiAnalysisResult,
  AiConnectionStatus,
  AiIndexStatus,
  AiInsightResponse,
  AiLocalHealth,
} from '../types/ai-analytics.types';

export function useAiAnalytics() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [panelResult, setPanelResult] = useState<AiInsightResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<AiConnectionStatus | null>(null);
  const [health, setHealth] = useState<AiLocalHealth | null>(null);
  const [indexStatus, setIndexStatus] = useState<AiIndexStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelLoading, setPanelLoading] = useState('');
  const [rebuilding, setRebuilding] = useState(false);
  const [error, setError] = useState('');

  async function loadConnectionStatus() {
    setError('');
    try {
      setConnectionStatus(await aiAnalyticsService.testConnection());
    } catch (err) {
      setConnectionStatus({
        success: true,
        provider: 'RULE_BASED',
        mode: 'RULE_BASED_FALLBACK',
        configured: false,
        keyConfigured: false,
        timeoutMs: 30000,
        answer: 'No se pudo probar la IA en la nube. El análisis interno sigue disponible.',
        warnings: [err instanceof Error ? err.message : 'No se pudo probar la IA cloud.'],
        generatedAt: new Date().toISOString(),
      });
    }
  }

  async function loadLocalStatus() {
    try {
      const [healthData, indexData] = await Promise.all([
        aiAnalyticsService.localHealth(),
        aiAnalyticsService.localIndexStatus().catch(() => null),
      ]);
      setHealth(healthData);
      setIndexStatus(indexData);
    } catch {
      setHealth({ status: 'error', service: 'innova-ai-service', ollama: 'disconnected', model: 'qwen3', rag: false });
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
    setPanelResult(null);
    try {
      setQuestion(cleanQuestion);
      setResult(await aiAnalyticsService.ask(cleanQuestion));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el análisis empresarial.');
    } finally {
      setLoading(false);
    }
  }

  async function runPanel(type: 'sales' | 'inventory' | 'profitability') {
    setPanelLoading(type);
    setError('');
    setResult(null);
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
      setError(err instanceof Error ? err.message : 'No se pudo reconstruir el indice RAG.');
    } finally {
      setRebuilding(false);
    }
  }

  return {
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
  };
}

