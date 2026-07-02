import { httpClient } from '../../../services/http-client';
import { DashboardSummary } from '../types/dashboard.types';

export const dashboardService = {
  async summary() {
    const { data } = await httpClient.get<DashboardSummary>('/dashboard/summary');
    return data;
  },
};
