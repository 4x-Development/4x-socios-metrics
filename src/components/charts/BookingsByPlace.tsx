import { rentalPlaceTypeLabels, type RentalPlaceStat } from '../../data/types';
import { formatCompactCurrency, formatNumber, formatPercent } from '../../lib/format';

interface Props {
  places: RentalPlaceStat[];
  /** Show the club column when consolidated across clubs. */
  clubLookup?: (placeId: number) => string | undefined;
}

const typeBadgeColors: Record<string, string> = {
  futbol: 'bg-emerald-50 text-emerald-700',
  padel: 'bg-navy-50 text-navy-700',
  tenis: 'bg-warning-50 text-warning-700',
  basquet: 'bg-positive-50 text-positive-700',
  multiple: 'bg-ink-100 text-ink-700',
};

export default function BookingsByPlace({ places }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-500">
            <th className="py-3 pr-3 font-semibold">Cancha</th>
            <th className="px-3 py-3 text-left font-semibold">Tipo</th>
            <th className="px-3 py-3 text-right font-semibold">Reservas</th>
            <th className="px-3 py-3 text-right font-semibold">Recaudado</th>
            <th className="px-3 py-3 text-right font-semibold">Ocupación</th>
            <th className="py-3 pl-3 text-right font-semibold">Socios</th>
          </tr>
        </thead>
        <tbody>
          {places.map((p, idx) => (
            <tr
              key={`${p.id}-${idx}`}
              className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50"
            >
              <td className="py-3 pr-3 font-medium text-ink-900">{p.name}</td>
              <td className="px-3 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    typeBadgeColors[p.type] ?? 'bg-ink-100 text-ink-700'
                  }`}
                >
                  {rentalPlaceTypeLabels[p.type]}
                </span>
              </td>
              <td className="px-3 py-3 text-right tabular text-ink-800">
                {formatNumber(p.bookings)}
              </td>
              <td className="px-3 py-3 text-right tabular font-semibold text-ink-900">
                {formatCompactCurrency(p.amount)}
              </td>
              <td className="px-3 py-3 text-right tabular">
                <span
                  className={
                    p.occupancyRate >= 0.65
                      ? 'text-positive-700'
                      : p.occupancyRate >= 0.4
                      ? 'text-ink-700'
                      : 'text-negative-700'
                  }
                >
                  {formatPercent(p.occupancyRate)}
                </span>
              </td>
              <td className="py-3 pl-3 text-right tabular text-ink-700">
                {formatPercent(p.partnerShare)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
