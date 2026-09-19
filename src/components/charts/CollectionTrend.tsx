import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyAggregate } from '../../data/types';
import { formatCompactCurrency, formatYearMonth } from '../../lib/format';

interface Props {
  series: MonthlyAggregate[];
}

export default function CollectionTrend({ series }: Props) {
  const data = series.map((m) => ({
    month: formatYearMonth(m.yearMonth, { withYear: true }),
    monto: m.collections.amount,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a3174" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#1a3174" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCompactCurrency(v)}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            width={70}
          />
          <Tooltip
            formatter={(v: number) => formatCompactCurrency(v)}
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
          <Area type="monotone" dataKey="monto" stroke="#1a3174" strokeWidth={2} fill="url(#colorMonto)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
