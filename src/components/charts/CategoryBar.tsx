import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { memberCategoryLabels, type CategoryStat } from '../../data/types';
import { formatCompactCurrency, formatNumber, formatPercent } from '../../lib/format';

interface Props {
  categories: CategoryStat[];
}

export default function CategoryBar({ categories }: Props) {
  const data = categories.map((c) => ({
    category: memberCategoryLabels[c.category],
    activos: c.active,
    cobrado: c.amount,
    tasa: c.collectionRate,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatNumber(v)}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'activos') return [formatNumber(value), 'Socios activos'];
              if (name === 'cobrado') return [formatCompactCurrency(value), 'Cobrado'];
              if (name === 'tasa') return [formatPercent(value), 'Tasa de cobranza'];
              return [String(value), name];
            }}
            contentStyle={{
              background: '#0f172a',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#cbd5e1', marginBottom: 4 }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="activos" name="Socios activos" fill="#4f70c8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
