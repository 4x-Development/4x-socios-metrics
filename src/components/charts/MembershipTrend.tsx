import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyAggregate } from '../../data/types';
import { formatNumber, formatYearMonth } from '../../lib/format';

interface Props {
  series: MonthlyAggregate[];
}

export default function MembershipTrend({ series }: Props) {
  const data = series.map((m) => ({
    month: formatYearMonth(m.yearMonth, { withYear: true }),
    altas: m.members.new,
    bajas: -m.members.resigned,
    activos: m.members.active,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => formatNumber(Math.abs(v))}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            width={50}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => formatNumber(v)}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v: number) => formatNumber(Math.abs(v))}
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
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar yAxisId="left" dataKey="altas" name="Altas" fill="#10b981" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="bajas" name="Bajas" fill="#ef4444" radius={[0, 0, 3, 3]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="activos"
            name="Padrón activo"
            stroke="#1a3174"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
