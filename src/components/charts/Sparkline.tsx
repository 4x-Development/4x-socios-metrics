import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface Props {
  values: number[];
  positive?: boolean;
  height?: number;
}

export default function Sparkline({ values, positive, height = 28 }: Props) {
  const data = values.map((v, i) => ({ i, v }));
  const last = values[values.length - 1] ?? 0;
  const first = values[0] ?? 0;
  const trendUp = last >= first;
  const color = positive === undefined
    ? trendUp ? '#10b981' : '#ef4444'
    : positive ? '#10b981' : '#ef4444';

  return (
    <div style={{ height, width: 80 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
