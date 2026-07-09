import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState } from '../../../components/ui';
import { Boxes } from 'lucide-react';
import { formatCurrency } from '../../reports/utils/report-formatters';
import { ProfitItem } from '../types/profitability.types';

export function CategoryProfitChart({ data }: { data: ProfitItem[] }) {
  if (!data.length) {
    return <EmptyState title="Sin categorías" description="Aún no hay datos suficientes para comparar categorías." icon={Boxes} />;
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 8)} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `S/ ${Number(value).toFixed(0)}`} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
          <Bar dataKey="profit" name="Utilidad" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
