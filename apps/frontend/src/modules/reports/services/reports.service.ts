import { httpClient } from '../../../services/http-client';
import {
  CashReport,
  ExportReportModule,
  InventoryReport,
  ProfitabilityReport,
  PurchasesReport,
  QuickServicesReport,
  ReportFilters,
  ReportsSummary,
  SalesReport,
  ServiceOrdersReport,
} from '../types/report.types';

export const reportsService = {
  async summary(params: ReportFilters) {
    const { data } = await httpClient.get<ReportsSummary>('/reports/summary', { params });
    return data;
  },
  async sales(params: ReportFilters) {
    const { data } = await httpClient.get<SalesReport>('/reports/sales', { params });
    return data;
  },
  async inventory(params: ReportFilters) {
    const { data } = await httpClient.get<InventoryReport>('/reports/inventory', { params });
    return data;
  },
  async serviceOrders(params: ReportFilters) {
    const { data } = await httpClient.get<ServiceOrdersReport>('/reports/service-orders', { params });
    return data;
  },
  async quickServices(params: ReportFilters) {
    const { data } = await httpClient.get<QuickServicesReport>('/reports/quick-services', { params });
    return data;
  },
  async purchases(params: ReportFilters) {
    const { data } = await httpClient.get<PurchasesReport>('/reports/purchases', { params });
    return data;
  },
  async cash(params: ReportFilters) {
    const { data } = await httpClient.get<CashReport>('/reports/cash', { params });
    return data;
  },
  async profitability(params: ReportFilters) {
    const { data } = await httpClient.get<ProfitabilityReport>('/reports/profitability-basic', { params });
    return data;
  },
  async export(module: ExportReportModule, type: 'pdf' | 'excel', params: ReportFilters) {
    const { data } = await httpClient.get<Blob>(`/reports/export/${module}/${type}`, { params, responseType: 'blob' });
    const extension = type === 'pdf' ? 'pdf' : 'xlsx';
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-${module}-${new Date().toISOString().slice(0, 10)}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
