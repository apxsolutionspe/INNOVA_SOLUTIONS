import { useEffect, useState } from 'react';
import { integrationsService } from '../services/integrations.service';
import { IntegrationItem, IntegrationProvider, IntegrationTestResult } from '../types/integration.types';

export function useIntegrations() {
  const [items, setItems] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<IntegrationTestResult | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await integrationsService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar integraciones');
    } finally {
      setLoading(false);
    }
  }

  async function test(provider: IntegrationProvider) {
    setError(null);
    try {
      const result = await integrationsService.test(provider);
      setTestResult(result);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo probar la integración');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return { items, loading, error, testResult, setTestResult, load, test };
}
