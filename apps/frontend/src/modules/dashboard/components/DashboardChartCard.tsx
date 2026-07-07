import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartDatum } from '../types/dashboard.types';
import { DashboardEmptyState } from './DashboardEmptyState';

interface DashboardChartCardProps {
  title: string;
  description: string;
  data: ChartDatum[];
  valuePrefix?: string;
}

const colors = ['#2563EB', '#06B6D4', '#7C3AED', '#10B981', '#F97316', '#EF4444'];

export function DashboardChartCard({ title, description, data, valuePrefix = '' }: DashboardChartCardProps) {
  const hasData = data.some((item) => item.value > 0);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-5 h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                formatter={(value) => [`${valuePrefix}${Number(value).toFixed(valuePrefix ? 2 : 0)}`, 'Valor']}
                contentStyle={{ borderRadius: 8, borderColor: '#E2E8F0', boxShadow: '0 12px 24px rgba(15,23,42,0.08)' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => <Cell key={entry.name} fill={entry.tone ?? colors[index % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <DashboardEmptyState title="Sin datos suficientes" description="Cuando se registren operaciones, este widget mostrará una lectura visual del negocio." />
        )}
      </div>
    </section>
  );
}

