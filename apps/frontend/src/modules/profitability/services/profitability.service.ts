import { httpClient } from '../../../services/http-client';
import { MonthlyProfit, ProfitItem, ProfitabilitySummary } from '../types/profitability.types';

function cleanParams(params: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export const profitabilityService = {
  async summary(params: Record<string, string | undefined>) {
    const { data } = await httpClient.get<ProfitabilitySummary>('/profitability/summary', { params: cleanParams(params) });
    return data;
  },
  async products(params: Record<string, string | undefined>) {
    const { data } = await httpClient.get<ProfitItem[]>('/profitability/products', { params: cleanParams(params) });
    return data;
  },
  async services(params: Record<string, string | undefined>) {
    const { data } = await httpClient.get<ProfitItem[]>('/profitability/services', { params: cleanParams(params) });
    return data;
  },
  async monthly(params: Record<string, string | undefined>) {
    const { data } = await httpClient.get<MonthlyProfit[]>('/profitability/monthly', { params: cleanParams(params) });
    return data;
  },
  async categories(params: Record<string, string | undefined>) {
    const { data } = await httpClient.get<ProfitItem[]>('/profitability/categories', { params: cleanParams(params) });
    return data;
  },
};
