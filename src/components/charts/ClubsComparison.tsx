import Sparkline from './Sparkline';
import type { Club, MonthlyAggregate, PaymentChannel } from '../../data/types';
import { paymentChannelLabels } from '../../data/types';
import {
  formatCompactCurrency,
  formatDeltaPercent,
  formatNumber,
  formatPercent,
} from '../../lib/format';

interface Props {
  clubs: Club[];
  /** Latest aggregate per club (length === clubs.length) */
  latest: MonthlyAggregate[];
  /** Aggregate one month back (length === clubs.length) */
  previous: MonthlyAggregate[];
  /** 12-month series of amount per club, indexed same as clubs */
  series: { clubId: string; amounts: number[]; actives: number[] }[];
  /** Optional best channel per club */
  bestChannel?: { clubId: string; channel: PaymentChannel }[];
}

export default function ClubsComparison({
  clubs,
  latest,
  previous,
  series,
  bestChannel,
}: Props) {
  const rows = clubs.map((club) => {
    const cur = latest.find((m) => m.clubId === club.id);
    const prev = previous.find((m) => m.clubId === club.id);
    const sparks = series.find((s) => s.clubId === club.id);
    const best = bestChannel?.find((b) => b.clubId === club.id);
    return { club, cur, prev, sparks, best };
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            <th className="py-3 pr-3 font-semibold">Club</th>
            <th className="px-3 py-3 text-right font-semibold">Socios activos</th>
            <th className="px-3 py-3 text-right font-semibold">Cobrado</th>
            <th className="px-3 py-3 text-right font-semibold">Vs. mes anterior</th>
            <th className="px-3 py-3 text-right font-semibold">Tasa cobranza</th>
            <th className="px-3 py-3 text-right font-semibold">Ticket promedio</th>
            <th className="px-3 py-3 text-left font-semibold">Canal líder</th>
            <th className="py-3 pl-3 text-center font-semibold">Tendencia</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ club, cur, prev, sparks, best }) => {
            if (!cur || !prev) return null;
            const delta = formatDeltaPercent(cur.collections.amount, prev.collections.amount);
            const deltaPos = cur.collections.amount >= prev.collections.amount;
            return (
              <tr key={club.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                <td className="py-3 pr-3">
                  <a href={`/clubes/${club.id}`} className="font-medium text-ink-900 hover:text-navy-700">
                    {club.shortName}
                  </a>
                  <div className="text-[11px] text-ink-500">{club.city}</div>
                </td>
                <td className="px-3 py-3 text-right tabular text-ink-800">
                  {formatNumber(cur.members.active)}
                </td>
                <td className="px-3 py-3 text-right tabular font-semibold text-ink-900">
                  {formatCompactCurrency(cur.collections.amount)}
                </td>
                <td
                  className={`px-3 py-3 text-right tabular text-xs font-semibold ${
                    deltaPos ? 'text-positive-700' : 'text-negative-700'
                  }`}
                >
                  {delta}
                </td>
                <td className="px-3 py-3 text-right tabular">
                  <span
                    className={
                      cur.collections.collectionRate >= 0.9
                        ? 'text-positive-700'
                        : cur.collections.collectionRate >= 0.83
                        ? 'text-ink-700'
                        : 'text-negative-700'
                    }
                  >
                    {formatPercent(cur.collections.collectionRate)}
                  </span>
                </td>
                <td className="px-3 py-3 text-right tabular text-ink-800">
                  {formatCompactCurrency(cur.collections.avgTicket)}
                </td>
                <td className="px-3 py-3 text-left">
                  {best && (
                    <span className="inline-flex rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-700">
                      {paymentChannelLabels[best.channel]}
                    </span>
                  )}
                </td>
                <td className="py-3 pl-3">
                  <div className="flex justify-center">
                    {sparks && <Sparkline values={sparks.amounts} />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
