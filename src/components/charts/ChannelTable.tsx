import {
  paymentChannelColors,
  paymentChannelLabels,
  type ChannelStat,
} from '../../data/types';
import { formatCompactCurrency, formatNumber, formatPercent } from '../../lib/format';

interface Props {
  channels: ChannelStat[];
}

export default function ChannelTable({ channels }: Props) {
  const sorted = [...channels].sort((a, b) => b.amount - a.amount);
  const total = sorted.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            <th className="py-3 pr-3 font-semibold">Canal</th>
            <th className="px-3 py-3 text-right font-semibold">Transacciones</th>
            <th className="px-3 py-3 text-right font-semibold">Monto</th>
            <th className="px-3 py-3 text-right font-semibold">Share</th>
            <th className="px-3 py-3 text-right font-semibold">Ticket promedio</th>
            <th className="px-3 py-3 text-right font-semibold">Días vs. vencimiento</th>
            <th className="py-3 pl-3 text-right font-semibold">Éxito</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const share = total > 0 ? c.amount / total : 0;
            return (
              <tr
                key={c.channel}
                className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50"
              >
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ background: paymentChannelColors[c.channel] }}
                      aria-hidden
                    />
                    <span className="font-medium text-ink-900">{paymentChannelLabels[c.channel]}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular text-ink-800">{formatNumber(c.count)}</td>
                <td className="px-3 py-3 text-right tabular font-semibold text-ink-900">
                  {formatCompactCurrency(c.amount)}
                </td>
                <td className="px-3 py-3 text-right tabular text-ink-600">{formatPercent(share)}</td>
                <td className="px-3 py-3 text-right tabular text-ink-800">
                  {formatCompactCurrency(c.avgTicket)}
                </td>
                <td className="px-3 py-3 text-right tabular text-ink-600">{c.avgDaysToCollect} d</td>
                <td className="py-3 pl-3 text-right tabular">
                  {c.successRate === null ? (
                    <span className="text-ink-400" title="Sólo Mercado Pago informa intentos de pago">
                      —
                    </span>
                  ) : (
                    <span
                      className={
                        c.successRate >= 0.97
                          ? 'text-positive-700'
                          : c.successRate >= 0.93
                            ? 'text-ink-700'
                            : 'text-negative-700'
                      }
                    >
                      {formatPercent(c.successRate)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
