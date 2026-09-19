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
import { formatCompactCurrency, formatNumber, formatYearMonth } from '../../lib/format';

interface Props {
  series: { yearMonth: string; total: number; amount: number }[];
  /** Label for the bar that represents the count metric (e.g. "Reservas", "Pagos"). */
  countLabel: string;
  /** Label for the line that represents the amount metric. Defaults to "Recaudado". */
  amountLabel?: string;
}

/**
 * Generic monthly trend: bar with the count + line with the amount, sharing X axis.
 * Domain-agnostic — the caller provides the label for the count metric.
 */
export default function MonthlyVolumeTrend({
  series,
  countLabel,
  amountLabel = 'Recaudado',
}: Props) {
  const data = series.map((s) => ({
    month: formatYearMonth(s.yearMonth, { withYear: true }),
    count: s.total,
    amount: s.amount,
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
            tickFormatter={(v) => formatNumber(v)}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            width={50}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => formatCompactCurrency(v)}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
            width={70}
          />
          <Tooltip
            formatter={(v: number, name: string) =>
              name === amountLabel
                ? [formatCompactCurrency(v), amountLabel]
                : [formatNumber(v), countLabel]
            }
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
          <Bar
            yAxisId="left"
            dataKey="count"
            name={countLabel}
            fill="#7e9adc"
            radius={[3, 3, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="amount"
            name={amountLabel}
            stroke="#1a3174"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
