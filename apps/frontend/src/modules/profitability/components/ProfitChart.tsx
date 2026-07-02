import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState } from '../../../components/ui';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../reports/utils/report-formatters';
import { MonthlyProfit } from '../types/profitability.types';

export function ProfitChart({ data }: { data: MonthlyProfit[] }) {
  if (!data.length) {
    return <EmptyState title="Sin tendencia disponible" description="No hay movimientos financieros en el rango seleccionado." icon={BarChart3} />;
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.24} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} /></linearGradient>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.22} /><stop offset="95%" stopColor="#f97316" stopOpacity={0.02} /></linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="95%" stopColor="#10b981" stopOpacity={0.02} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `S/ ${Number(value).toFixed(0)}`} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
          <Legend />
          <Area name="Ingresos" type="monotone" dataKey="income" stroke="#2563eb" fill="url(#incomeGradient)" strokeWidth={2} />
          <Area name="Costos" type="monotone" dataKey="costs" stroke="#f97316" fill="url(#costGradient)" strokeWidth={2} />
          <Area name="Utilidad neta" type="monotone" dataKey="profit" stroke="#10b981" fill="url(#profitGradient)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
