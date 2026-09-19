/**
 * Court bookings, straight from the club's DB.
 *
 * Sources: `ShiftBooking` (one row per reservation), `ShiftBookingDetail`
 * (players, either partners or named guests), `RentalPlaces` (the courts) and
 * `RentalPlacesAvailable` (weekly availability windows, used as the occupancy
 * denominator).
 *
 * Only clubs that actually operate courts have rows here. A club with no
 * bookings returns `null` rather than zeros, so the UI can say "sin datos"
 * instead of drawing an empty chart that looks like a collapse in demand.
 */

import sql from 'mssql';
import { getClubPool } from '../pools';
import type { BookingStat, RentalPlaceStat, RentalPlaceType } from '../../data/types';

interface TotalsRow {
  Total: number;
  Cancelled: number;
  Amount: number | null;
  PartnerBookings: number;
  GuestBookings: number;
}

interface PlaceRow {
  Id: number;
  Name: string | null;
  Type: string | null;
  Bookings: number;
  Amount: number | null;
  PartnerBookings: number;
  WeeklyHours: number | null;
  ShiftDuration: number | null;
}

interface DistributionRow {
  Bucket: number;
  Count: number;
}

/** Map the free-text `RentalPlaces.Type` of each club onto our canonical set. */
function normalizePlaceType(raw: string | null): RentalPlaceType {
  const t = (raw ?? '').toLowerCase();
  if (t.includes('futbol') || t.includes('fútbol') || t.includes('f5') || t.includes('f7')) return 'futbol';
  if (t.includes('padel') || t.includes('pádel')) return 'padel';
  if (t.includes('tenis')) return 'tenis';
  if (t.includes('basquet') || t.includes('básquet') || t.includes('basket')) return 'basquet';
  return 'multiple';
}

/**
 * Bookings for one club and one period (`yyyy-mm`).
 * Returns null when the club has no bookings in that month.
 */
export async function getClubBookingsReal(
  clubId: string,
  yearMonth: string,
): Promise<BookingStat | null> {
  const [year, month] = yearMonth.split('-').map(Number);
  const pool = await getClubPool(clubId);

  const withPeriod = () =>
    pool.request().input('year', sql.Int, year).input('month', sql.Int, month);

  const [totals, places, weekday, hourly] = await Promise.all([
    withPeriod().query<TotalsRow>(`
      SELECT
        COUNT(*) AS Total,
        SUM(CASE WHEN SB.Active = 0 THEN 1 ELSE 0 END) AS Cancelled,
        SUM(CASE WHEN SB.Active = 1 THEN SB.TotalAmount ELSE 0 END) AS Amount,
        SUM(CASE WHEN SB.Active = 1 AND SB.PartnerId IS NOT NULL THEN 1 ELSE 0 END) AS PartnerBookings,
        SUM(CASE WHEN SB.Active = 1 AND SB.PartnerId IS NULL THEN 1 ELSE 0 END) AS GuestBookings
      FROM dbo.ShiftBooking SB
      WHERE YEAR(SB.ReservationDate) = @year AND MONTH(SB.ReservationDate) = @month
    `),

    withPeriod().query<PlaceRow>(`
      SELECT
        RP.Id,
        RP.Name,
        RP.Type,
        RP.ShiftDuration AS ShiftDuration,
        ISNULL(SUM(CASE WHEN SB.Active = 1 THEN 1 ELSE 0 END), 0) AS Bookings,
        ISNULL(SUM(CASE WHEN SB.Active = 1 THEN SB.TotalAmount ELSE 0 END), 0) AS Amount,
        ISNULL(SUM(CASE WHEN SB.Active = 1 AND SB.PartnerId IS NOT NULL THEN 1 ELSE 0 END), 0) AS PartnerBookings,
        (SELECT ISNULL(SUM((RPA.ToAvailableHour - RPA.FromAvailableHour) * (RPA.ToWeekDay - RPA.FromWeekDay + 1)), 0)
           FROM dbo.RentalPlacesAvailable RPA
          WHERE RPA.RentalPlaceId = RP.Id AND RPA.Active = 1 AND RPA.Available = 1) AS WeeklyHours
      FROM dbo.RentalPlaces RP
      LEFT JOIN dbo.ShiftBooking SB
        ON SB.RentalPlaceId = RP.Id
       AND YEAR(SB.ReservationDate) = @year
       AND MONTH(SB.ReservationDate) = @month
      WHERE RP.Active = 1
      GROUP BY RP.Id, RP.Name, RP.Type, RP.ShiftDuration
    `),

    withPeriod().query<DistributionRow>(`
      SELECT DATEPART(WEEKDAY, SB.ReservationDate) - 1 AS Bucket, COUNT(*) AS Count
      FROM dbo.ShiftBooking SB
      WHERE SB.Active = 1
        AND YEAR(SB.ReservationDate) = @year AND MONTH(SB.ReservationDate) = @month
      GROUP BY DATEPART(WEEKDAY, SB.ReservationDate)
    `),

    withPeriod().query<DistributionRow>(`
      SELECT DATEPART(HOUR, SB.ReservationDate) AS Bucket, COUNT(*) AS Count
      FROM dbo.ShiftBooking SB
      WHERE SB.Active = 1
        AND YEAR(SB.ReservationDate) = @year AND MONTH(SB.ReservationDate) = @month
      GROUP BY DATEPART(HOUR, SB.ReservationDate)
    `),
  ]);

  const t = totals.recordset[0];
  if (!t || t.Total === 0) return null;

  const active = t.Total - t.Cancelled;
  const amount = Math.round(Number(t.Amount ?? 0));
  // Rough month length in weeks, used to scale the weekly availability window.
  const weeksInMonth = new Date(year, month, 0).getDate() / 7;

  const byPlace: RentalPlaceStat[] = places.recordset.map((p) => {
    const shiftHours = (p.ShiftDuration ?? 60) / 60;
    const slots =
      p.WeeklyHours && shiftHours > 0 ? (Number(p.WeeklyHours) / shiftHours) * weeksInMonth : 0;
    return {
      id: p.Id,
      name: p.Name ?? `Cancha ${p.Id}`,
      type: normalizePlaceType(p.Type),
      bookings: p.Bookings,
      amount: Math.round(Number(p.Amount ?? 0)),
      occupancyRate: slots > 0 ? Math.min(1, Math.round((p.Bookings / slots) * 1000) / 1000) : 0,
      partnerShare: p.Bookings > 0 ? Math.round((p.PartnerBookings / p.Bookings) * 1000) / 1000 : 0,
    };
  });

  const placesWithSlots = byPlace.filter((p) => p.occupancyRate > 0);
  const occupancyRate =
    placesWithSlots.length > 0
      ? Math.round(
          (placesWithSlots.reduce((acc, p) => acc + p.occupancyRate, 0) / placesWithSlots.length) *
            1000,
        ) / 1000
      : 0;

  const weekdayDistribution = Array<number>(7).fill(0);
  for (const row of weekday.recordset) {
    const idx = ((row.Bucket % 7) + 7) % 7;
    weekdayDistribution[idx] = row.Count;
  }

  const hourlyDistribution = Array<number>(24).fill(0);
  for (const row of hourly.recordset) {
    if (row.Bucket >= 0 && row.Bucket < 24) hourlyDistribution[row.Bucket] = row.Count;
  }

  return {
    clubId,
    yearMonth,
    total: active,
    amount,
    avgTicket: active > 0 ? Math.round(amount / active) : 0,
    partnerBookings: t.PartnerBookings,
    guestBookings: t.GuestBookings,
    cancelledRate: t.Total > 0 ? Math.round((t.Cancelled / t.Total) * 1000) / 1000 : 0,
    occupancyRate,
    byPlace: byPlace.filter((p) => p.bookings > 0).sort((a, b) => b.amount - a.amount),
    weekdayDistribution,
    hourlyDistribution,
  };
}

interface BookingTrendRow {
  Y: number;
  M: number;
  Bookings: number;
  Amount: number | null;
}

/** Monthly bookings + revenue for the last N months. Empty array when the club has no courts. */
export async function getClubBookingTrendReal(
  clubId: string,
  monthsBack = 12,
): Promise<Array<{ yearMonth: string; bookings: number; amount: number }>> {
  const pool = await getClubPool(clubId);
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const result = await pool
    .request()
    .input('from', sql.DateTime, from)
    .query<BookingTrendRow>(`
      SELECT YEAR(SB.ReservationDate) AS Y, MONTH(SB.ReservationDate) AS M,
             COUNT(*) AS Bookings,
             ISNULL(SUM(SB.TotalAmount), 0) AS Amount
      FROM dbo.ShiftBooking SB
      WHERE SB.Active = 1 AND SB.ReservationDate >= @from
      GROUP BY YEAR(SB.ReservationDate), MONTH(SB.ReservationDate)
      ORDER BY YEAR(SB.ReservationDate), MONTH(SB.ReservationDate)
    `);

  return result.recordset.map((r) => ({
    yearMonth: `${r.Y}-${String(r.M).padStart(2, '0')}`,
    bookings: r.Bookings,
    amount: Math.round(Number(r.Amount ?? 0)),
  }));
}
