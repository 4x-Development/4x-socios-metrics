import { formatNumber } from '../../lib/format';

interface Props {
  hourly: number[];
}

/**
 * Horizontal bar layout where each hour shows a bar proportional to the count.
 * Domain-agnostic — used both for court bookings and Red Link payments.
 */
export default function HourlyHeatmap({ hourly }: Props) {
  const max = Math.max(...hourly, 1);
  const visibleHours = hourly.map((v, h) => ({ hour: h, value: v }));

  return (
    <div className="space-y-1.5">
      {visibleHours.map(({ hour, value }) => {
        const widthPct = (value / max) * 100;
        const isPeak = value >= max * 0.7;
        const isQuiet = value < max * 0.15;
        return (
          <div key={hour} className="flex items-center gap-3 text-xs">
            <span className="w-12 flex-shrink-0 tabular text-ink-500">
              {String(hour).padStart(2, '0')}:00
            </span>
            <div className="flex-1">
              <div className="h-3 overflow-hidden rounded-sm bg-ink-100">
                <div
                  className={`h-full rounded-sm transition-all ${
                    isPeak
                      ? 'bg-navy-600'
                      : isQuiet
                      ? 'bg-ink-300'
                      : 'bg-navy-400'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
            <span className="w-12 flex-shrink-0 text-right tabular text-ink-700">
              {value > 0 ? formatNumber(value) : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
