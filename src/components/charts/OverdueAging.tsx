import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { OverdueBucket } from '../../data/types';
import { formatCompactCurrency, formatNumber } from '../../lib/format';

interface Props {
  buckets: OverdueBucket[];
}

const bucketColors = ['#7e9adc', '#4f70c8', '#1a3174', '#0f1d44'];

export default function OverdueAging({ buckets }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
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
            formatter={(v: number, name: string) => {
              if (name === 'amount') return [formatCompactCurrency(v), 'Monto'];
              return [formatNumber(v), 'Cuotas'];
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
          <Bar dataKey="amount" name="Monto" radius={[4, 4, 0, 0]}>
            {buckets.map((_, idx) => (
              <Cell key={idx} fill={bucketColors[idx % bucketColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
