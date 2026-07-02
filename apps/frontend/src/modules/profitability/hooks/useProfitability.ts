import { useCallback, useEffect, useState } from 'react';
import { profitabilityService } from '../services/profitability.service';
import { MonthlyProfit, ProfitItem, ProfitabilitySummary } from '../types/profitability.types';

export function useProfitability() {
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [summary, setSummary] = useState<ProfitabilitySummary | null>(null);
  const [products, setProducts] = useState<ProfitItem[]>([]);
  const [services, setServices] = useState<ProfitItem[]>([]);
  const [monthly, setMonthly] = useState<MonthlyProfit[]>([]);
  const [categories, setCategories] = useState<ProfitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [s, p, sv, m, c] = await Promise.all([profitabilityService.summary(filters), profitabilityService.products(filters), profitabilityService.services(filters), profitabilityService.monthly(filters), profitabilityService.categories(filters)]);
      setSummary(s); setProducts(p); setServices(sv); setMonthly(m); setCategories(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar rentabilidad.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { void load(); }, [load]);
  return { filters, setFilters, summary, products, services, monthly, categories, isLoading, error, load };
}
