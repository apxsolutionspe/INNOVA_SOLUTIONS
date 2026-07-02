import { httpClient } from '../../../services/http-client';
import { AiAnalysisResult, AiIndexStatus, AiInsightResponse, AiLocalHealth } from '../types/ai-analytics.types';

export const aiAnalyticsService = {
  async localHealth() {
    const { data } = await httpClient.get<AiLocalHealth>('/ai-local/health');
    return data;
  },
  async localIndexStatus() {
    const { data } = await httpClient.get<AiIndexStatus>('/ai-local/index-status');
    return data;
  },
  async localAsk(question: string, useRag = true) {
    const { data } = await httpClient.post<AiAnalysisResult>('/ai-local/ask', { question, useRag });
    return { ...data, mode: normalizeLocalMode(data.mode) };
  },
  async rebuildIndex() {
    const { data } = await httpClient.post<AiIndexStatus>('/ai-local/rebuild-index', { includeDocs: true });
    return data;
  },
  async ask(question: string) {
    const { data } = await httpClient.post<AiAnalysisResult>('/ai-analytics/ask', { question });
    return data;
  },
  async businessSummary() {
    const { data } = await httpClient.get<AiInsightResponse>('/ai-analytics/business-summary');
    return data;
  },
  async salesInsights() {
    const { data } = await httpClient.get<AiInsightResponse>('/ai-analytics/sales-insights');
    return data;
  },
  async inventoryInsights() {
    const { data } = await httpClient.get<AiInsightResponse>('/ai-analytics/inventory-insights');
    return data;
  },
  async profitabilityInsights() {
    const { data } = await httpClient.get<AiInsightResponse>('/ai-analytics/profitability-insights');
    return data;
  },
};

function normalizeLocalMode(mode: string) {
  const normalized = mode.toUpperCase().replaceAll('-', '_');
  if (normalized === 'LOCAL_RAG' || normalized === 'LOCAL_FALLBACK') return normalized;
  if (normalized.includes('LOCAL')) return 'LOCAL';
  return normalized as AiAnalysisResult['mode'];
}
