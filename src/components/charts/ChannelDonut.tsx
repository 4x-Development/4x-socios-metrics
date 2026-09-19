import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  paymentChannelColors,
  paymentChannelLabels,
  type ChannelStat,
} from '../../data/types';
import { formatCompactCurrency, formatPercent } from '../../lib/format';

interface Props {
  channels: ChannelStat[];
  metric?: 'amount' | 'count';
}

export default function ChannelDonut({ channels, metric = 'amount' }: Props) {
  const total = channels.reduce((acc, c) => acc + c[metric], 0);
  const data = channels.map((c) => ({
    name: paymentChannelLabels[c.channel],
    value: c[metric],
    share: total > 0 ? c[metric] / total : 0,
    color: paymentChannelColors[c.channel],
  }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative h-56 w-56 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                metric === 'amount'
                  ? formatCompactCurrency(value)
                  : value.toLocaleString('es-AR')
              }
              contentStyle={{
                background: '#0f172a',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 12,
                padding: '8px 12px',
              }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            {metric === 'amount' ? 'Monto total' : 'Transacciones'}
          </div>
          <div className="text-lg font-extrabold text-ink-900 tabular">
            {metric === 'amount'
              ? formatCompactCurrency(total)
              : total.toLocaleString('es-AR')}
          </div>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
              style={{ background: d.color }}
              aria-hidden
            />
            <span className="flex-1 text-sm font-medium text-ink-800">{d.name}</span>
            <span className="text-xs text-ink-500 tabular">{formatPercent(d.share)}</span>
            <span className="w-20 text-right text-sm font-semibold text-ink-900 tabular">
              {metric === 'amount'
                ? formatCompactCurrency(d.value)
                : d.value.toLocaleString('es-AR')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
