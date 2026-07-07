import { ProfitItem } from '../types/profitability.types';
import { ProductProfitTable } from './ProductProfitTable';

export function ServiceProfitTable({ items, title }: { items: ProfitItem[]; title: string }) {
  return <ProductProfitTable title={title} items={items} kind="service" />;
}
