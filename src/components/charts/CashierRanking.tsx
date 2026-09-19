import type { Cashier, Club } from '../../data/types';
import { formatCompactCurrency, formatNumber } from '../../lib/format';

interface Props {
  cashiers: Cashier[];
  clubs: Club[];
  limit?: number;
}

export default function CashierRanking({ cashiers, clubs, limit = 10 }: Props) {
  const clubMap = new Map(clubs.map((c) => [c.id, c]));
  const sorted = [...cashiers].sort((a, b) => b.amount - a.amount).slice(0, limit);
  const maxAmount = sorted[0]?.amount ?? 1;

  return (
    <ol className="space-y-2.5">
      {sorted.map((c, idx) => {
        const club = clubMap.get(c.clubId);
        const widthPct = (c.amount / maxAmount) * 100;
        return (
          <li key={c.id} className="flex items-center gap-3">
            <span className="w-5 text-center text-xs font-semibold text-ink-400 tabular">
              {idx + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink-900">{c.name}</span>
                <span className="text-sm font-semibold text-ink-900 tabular">
                  {formatCompactCurrency(c.amount)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-ink-500">
                <span>{club?.shortName ?? c.clubId}</span>
                <span className="tabular">{formatNumber(c.collectionsCount)} cobranzas</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-navy-500"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
