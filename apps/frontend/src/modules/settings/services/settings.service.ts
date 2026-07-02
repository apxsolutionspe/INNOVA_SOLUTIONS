import { httpClient } from '../../../services/http-client';
import { BusinessSettings, TaxSettings } from '../types/settings.types';

export const settingsService = {
  async business() {
    const { data } = await httpClient.get<BusinessSettings>('/settings/business');
    return data;
  },
  async updateBusiness(payload: Partial<BusinessSettings>) {
    const { data } = await httpClient.patch<BusinessSettings>('/settings/business', payload);
    return data;
  },
  async tax() {
    const { data } = await httpClient.get<TaxSettings>('/settings/tax');
    return data;
  },
  async updateTax(payload: Partial<TaxSettings>) {
    const { data } = await httpClient.patch<TaxSettings>('/settings/tax', payload);
    return data;
  },
};
