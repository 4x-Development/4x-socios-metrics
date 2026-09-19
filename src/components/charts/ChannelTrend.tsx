import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  paymentChannelColors,
  paymentChannelLabels,
  type MonthlyAggregate,
  type PaymentChannel,
} from '../../data/types';
import { formatCompactCurrency, formatYearMonth } from '../../lib/format';

interface Props {
  series: MonthlyAggregate[];
  metric?: 'amount' | 'count';
}

const channels: PaymentChannel[] = ['mercado-pago', 'red-link', 'punto-cobro', 'cobrador'];

export default function ChannelTrend({ series, metric = 'amount' }: Props) {
  const data = series.map((m) => {
    const row: Record<string, string | number> = { month: formatYearMonth(m.yearMonth, { withYear: true }) };
    for (const ch of channels) {
      const stat = m.byChannel.find((c) => c.channel === ch);
      row[ch] = stat ? stat[metric] : 0;
    }
    return row;
  });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => (metric === 'amount' ? formatCompactCurrency(v) : String(v))}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            width={70}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              metric === 'amount' ? formatCompactCurrency(value) : value.toLocaleString('es-AR'),
              paymentChannelLabels[name as PaymentChannel],
            ]}
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
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value) => paymentChannelLabels[value as PaymentChannel]}
          />
          {channels.map((ch) => (
            <Line
              key={ch}
              type="monotone"
              dataKey={ch}
              stroke={paymentChannelColors[ch]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
