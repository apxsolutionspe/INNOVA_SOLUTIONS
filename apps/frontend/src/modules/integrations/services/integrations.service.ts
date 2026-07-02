import { httpClient } from '../../../services/http-client';
import { IntegrationItem, IntegrationProvider, IntegrationTestResult } from '../types/integration.types';

export const integrationsService = {
  async list() {
    const { data } = await httpClient.get<IntegrationItem[]>('/integrations');
    return data;
  },
  async update(provider: IntegrationProvider, payload: { mode?: string; isEnabled?: boolean; publicConfig?: Record<string, unknown> }) {
    const { data } = await httpClient.patch<IntegrationItem>(`/integrations/${provider}/config`, payload);
    return data;
  },
  async test(provider: IntegrationProvider) {
    const { data } = await httpClient.post<IntegrationTestResult>(`/integrations/${provider}/test`);
    return data;
  },
};
