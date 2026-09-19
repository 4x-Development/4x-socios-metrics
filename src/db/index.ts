/**
 * Public data facade for the dashboard.
 *
 * Pages import from this module only. Every number it returns comes from a
 * club's SQL Server database — there is no mock data and no synthetic
 * fallback. When a club can't be read (no connection string, query error), it
 * is excluded from the result and the reason travels with it, so the UI can
 * say so out loud instead of drawing a plausible-looking chart.
 *
 * Results are memoized per process: an Astro build renders several pages and
 * each one would otherwise re-query every club.
 */

import { clubs, getClub } from '../data/clubs';
import { latestMonth, months, previousMonth } from '../data/periods';
import { getActiveClubs } from '../data/clubs-catalog';
import { hasClubConnection } from './pools';
import { getClubMonthlySeriesReal } from './queries/aggregate';
import { getRedLinkSummaryReal } from './queries/redlink';
import { getClubBookingsReal, getClubBookingTrendReal } from './queries/bookings';
import { getCashiersReal, getOverdueBucketsReal, getSyncIssuesReal } from './queries/operations';
import type {
  BookingStat,
  Cashier,
  CategoryStat,
  ChannelStat,
  Club,
  MemberCategory,
  MonthlyAggregate,
  OverdueBucket,
  PaymentChannel,
  RedLinkConsolidated,
  RedLinkSummary,
  SyncIssue,
} from '../data/types';

export { hasClubConnection } from './pools';
export { clubs, getClub } from '../data/clubs';
export { isCurrentMonth, latestMonth, months, previousMonth } from '../data/periods';
export type { Club, MonthlyAggregate, RedLinkConsolidated, RedLinkSummary };

/** A club that contributes no data, and why. */
export interface ExcludedClub {
  id: string;
  name: string;
  reason: string;
}

export interface DashboardData {
  /** Clubs that returned data. */
  clubs: Club[];
  /** Clubs left out, with the reason. Never silently dropped. */
  excluded: ExcludedClub[];
  months: string[];
  latestMonth: string;
  previousMonth: string;
  /** One entry per included club per month. */
  aggregates: MonthlyAggregate[];
}

const NO_CONNECTION = 'Sin connection string configurada';

function excludedEntry(clubId: string, reason: string): ExcludedClub {
  return { id: clubId, name: getClub(clubId)?.name ?? clubId, reason };
}

function errorReason(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  // SQL Server errors are verbose; one line is enough for the UI.
  return raw.split('\n')[0].slice(0, 200);
}

let dashboardPromise: Promise<DashboardData> | null = null;

/**
 * Twelve months of metrics for every club that can be read.
 * Memoized for the life of the process.
 */
export function loadDashboard(): Promise<DashboardData> {
  if (!dashboardPromise) dashboardPromise = loadDashboardUncached();
  return dashboardPromise;
}

async function loadDashboardUncached(): Promise<DashboardData> {
  const configured = getActiveClubs().filter((c) => hasClubConnection(c.id));
  const excluded: ExcludedClub[] = getActiveClubs()
    .filter((c) => !hasClubConnection(c.id))
    .map((c) => excludedEntry(c.id, NO_CONNECTION));

  const settled = await Promise.allSettled(
    configured.map((c) => getClubMonthlySeriesReal(c.id)),
  );

  const aggregates: MonthlyAggregate[] = [];
  const includedIds: string[] = [];

  settled.forEach((result, i) => {
    const clubId = configured[i].id;
    if (result.status === 'fulfilled') {
      aggregates.push(...result.value);
      includedIds.push(clubId);
    } else {
      console.error(`[db] club "${clubId}" excluded:`, errorReason(result.reason));
      excluded.push(excludedEntry(clubId, errorReason(result.reason)));
    }
  });

  return {
    clubs: clubs.filter((c) => includedIds.includes(c.id)),
    excluded,
    months,
    latestMonth,
    previousMonth,
    aggregates,
  };
}

/* ------------------------------------------------------------------ *
 *  Derivations over the loaded aggregates
 * ------------------------------------------------------------------ */

/** Aggregates of one club, oldest month first. */
export function clubSeries(data: DashboardData, clubId: string): MonthlyAggregate[] {
  return data.aggregates
    .filter((a) => a.clubId === clubId)
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
}

/** Every club's aggregate for one month. */
export function monthSlice(data: DashboardData, yearMonth: string): MonthlyAggregate[] {
  return data.aggregates.filter((a) => a.yearMonth === yearMonth);
}

function sumChannels(list: MonthlyAggregate[]): ChannelStat[] {
  const map = new Map<PaymentChannel, ChannelStat>();
  for (const agg of list) {
    for (const ch of agg.byChannel) {
      const cur = map.get(ch.channel);
      if (!cur) {
        map.set(ch.channel, { ...ch });
        continue;
      }
      const count = cur.count + ch.count;
      const amount = cur.amount + ch.amount;
      // Weighted averages: a big club shouldn't weigh the same as a small one.
      cur.avgDaysToCollect =
        count > 0
          ? Math.round(
              ((cur.avgDaysToCollect * cur.count + ch.avgDaysToCollect * ch.count) / count) * 10,
            ) / 10
          : 0;
      // Success rate exists only where the gateway reports attempts (Mercado
      // Pago). Averaging is done over the clubs that actually report it.
      if (cur.successRate !== null || ch.successRate !== null) {
        const curWeight = cur.successRate !== null ? cur.count : 0;
        const chWeight = ch.successRate !== null ? ch.count : 0;
        const weight = curWeight + chWeight;
        cur.successRate =
          weight > 0
            ? Math.round(
                (((cur.successRate ?? 0) * curWeight + (ch.successRate ?? 0) * chWeight) / weight) *
                  1000,
              ) / 1000
            : null;
      }
      cur.count = count;
      cur.amount = amount;
      cur.avgTicket = count > 0 ? Math.round(amount / count) : 0;
    }
  }

  const totalCount = [...map.values()].reduce((acc, c) => acc + c.count, 0);
  for (const ch of map.values()) {
    ch.adoptionRate = totalCount > 0 ? Math.round((ch.count / totalCount) * 1000) / 1000 : 0;
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

function sumCategories(list: MonthlyAggregate[]): CategoryStat[] {
  const map = new Map<MemberCategory, CategoryStat>();
  for (const agg of list) {
    for (const cat of agg.byCategory) {
      const cur = map.get(cat.category);
      if (!cur) {
        map.set(cat.category, { ...cat });
        continue;
      }
      cur.active += cat.active;
      cur.collectionsCount += cat.collectionsCount;
      cur.amount += cat.amount;
    }
  }
  for (const cat of map.values()) {
    cat.collectionRate =
      cat.active > 0 ? Math.round((cat.collectionsCount / cat.active) * 1000) / 1000 : 0;
  }
  return [...map.values()].sort((a, b) => b.active - a.active);
}

/**
 * All included clubs added together for one month.
 * Returns null when no club has data for that month — the caller shows an
 * empty state rather than a row of zeros.
 */
export function consolidatedForMonth(
  data: DashboardData,
  yearMonth: string,
): MonthlyAggregate | null {
  const list = monthSlice(data, yearMonth);
  if (list.length === 0) return null;

  const members = list.reduce(
    (acc, a) => ({
      active: acc.active + a.members.active,
      new: acc.new + a.members.new,
      resigned: acc.resigned + a.members.resigned,
      net: acc.net + a.members.net,
      retentionRate: 0,
      familyGroups: acc.familyGroups + a.members.familyGroups,
      avgFamilySize: acc.avgFamilySize + a.members.avgFamilySize,
    }),
    {
      active: 0,
      new: 0,
      resigned: 0,
      net: 0,
      retentionRate: 0,
      familyGroups: 0,
      avgFamilySize: 0,
    },
  );
  members.retentionRate =
    members.active > 0 ? Math.round((1 - members.resigned / members.active) * 1000) / 1000 : 0;
  members.avgFamilySize = Math.round((members.avgFamilySize / list.length) * 10) / 10;

  const count = list.reduce((acc, a) => acc + a.collections.count, 0);
  const amount = list.reduce((acc, a) => acc + a.collections.amount, 0);
  const issuedCount = list.reduce((acc, a) => acc + a.collections.issuedCount, 0);
  const issuedAmount = list.reduce((acc, a) => acc + a.collections.issuedAmount, 0);
  const overdueCount = list.reduce((acc, a) => acc + a.collections.overdueCount, 0);
  const overdueAmount = list.reduce((acc, a) => acc + a.collections.overdueAmount, 0);
  const daysWeighted = list.reduce(
    (acc, a) => acc + a.collections.avgDaysToCollect * a.collections.count,
    0,
  );

  return {
    clubId: 'consolidado',
    yearMonth,
    members,
    collections: {
      count,
      amount,
      issuedCount,
      issuedAmount,
      avgTicket: count > 0 ? Math.round(amount / count) : 0,
      collectionRate: issuedCount > 0 ? Math.round((count / issuedCount) * 1000) / 1000 : 0,
      amountCollectionRate:
        issuedAmount > 0 ? Math.round((amount / issuedAmount) * 1000) / 1000 : 0,
      overdueCount,
      overdueAmount,
      avgDaysToCollect: count > 0 ? Math.round((daysWeighted / count) * 10) / 10 : 0,
    },
    byChannel: sumChannels(list),
    byCategory: sumCategories(list),
  };
}

/** Consolidated series over the whole window; months with no data are dropped. */
export function consolidatedSeries(data: DashboardData): MonthlyAggregate[] {
  return data.months
    .map((ym) => consolidatedForMonth(data, ym))
    .filter((m): m is MonthlyAggregate => m !== null);
}

/* ------------------------------------------------------------------ *
 *  Section loaders
 * ------------------------------------------------------------------ */

export interface CashiersResult {
  cashiers: Cashier[];
  excluded: ExcludedClub[];
}

/** Collector ranking across clubs for one month. */
export async function loadCashiers(yearMonth: string): Promise<CashiersResult> {
  const configured = getActiveClubs().filter((c) => hasClubConnection(c.id));
  const excluded: ExcludedClub[] = getActiveClubs()
    .filter((c) => !hasClubConnection(c.id))
    .map((c) => excludedEntry(c.id, NO_CONNECTION));

  const settled = await Promise.allSettled(
    configured.map((c) => getCashiersReal(c.id, yearMonth)),
  );

  const cashiers: Cashier[] = [];
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') cashiers.push(...result.value);
    else excluded.push(excludedEntry(configured[i].id, errorReason(result.reason)));
  });

  return { cashiers: cashiers.sort((a, b) => b.amount - a.amount), excluded };
}

export interface SyncIssuesResult {
  issues: SyncIssue[];
  /** Clubs with no Mercado Pago activity at all — nothing to sync, not an error. */
  withoutGateway: string[];
  excluded: ExcludedClub[];
}

export async function loadSyncIssues(): Promise<SyncIssuesResult> {
  const configured = getActiveClubs().filter((c) => hasClubConnection(c.id));
  const excluded: ExcludedClub[] = [];
  const issues: SyncIssue[] = [];
  const withoutGateway: string[] = [];

  const settled = await Promise.allSettled(configured.map((c) => getSyncIssuesReal(c.id)));
  settled.forEach((result, i) => {
    const clubId = configured[i].id;
    if (result.status === 'rejected') {
      excluded.push(excludedEntry(clubId, errorReason(result.reason)));
      return;
    }
    if (result.value) issues.push(result.value);
    else withoutGateway.push(clubId);
  });

  return { issues, withoutGateway, excluded };
}

export interface OverdueResult {
  buckets: OverdueBucket[];
  excluded: ExcludedClub[];
}

/** Debt ageing added up across clubs. */
export async function loadOverdueBuckets(): Promise<OverdueResult> {
  const configured = getActiveClubs().filter((c) => hasClubConnection(c.id));
  const excluded: ExcludedClub[] = [];
  const totals = new Map<string, OverdueBucket>();

  const settled = await Promise.allSettled(configured.map((c) => getOverdueBucketsReal(c.id)));
  settled.forEach((result, i) => {
    if (result.status === 'rejected') {
      excluded.push(excludedEntry(configured[i].id, errorReason(result.reason)));
      return;
    }
    for (const bucket of result.value) {
      const cur = totals.get(bucket.label);
      if (cur) {
        cur.count += bucket.count;
        cur.amount += bucket.amount;
      } else {
        totals.set(bucket.label, { ...bucket });
      }
    }
  });

  return { buckets: [...totals.values()], excluded };
}

export interface BookingsResult {
  /** Only clubs that actually have bookings in the period. */
  byClub: BookingStat[];
  /** Clubs that answered but operate no courts (or had no bookings). */
  withoutBookings: string[];
  excluded: ExcludedClub[];
}

export async function loadBookings(yearMonth: string): Promise<BookingsResult> {
  const configured = getActiveClubs().filter((c) => hasClubConnection(c.id));
  const excluded: ExcludedClub[] = [];
  const byClub: BookingStat[] = [];
  const withoutBookings: string[] = [];

  const settled = await Promise.allSettled(
    configured.map((c) => getClubBookingsReal(c.id, yearMonth)),
  );
  settled.forEach((result, i) => {
    const clubId = configured[i].id;
    if (result.status === 'rejected') {
      excluded.push(excludedEntry(clubId, errorReason(result.reason)));
      return;
    }
    if (result.value) byClub.push(result.value);
    else withoutBookings.push(clubId);
  });

  return { byClub, withoutBookings, excluded };
}

/** Monthly bookings trend for the clubs that have courts. */
export async function loadBookingTrend(
  clubIds: string[],
  monthsBack = 12,
): Promise<Array<{ yearMonth: string; bookings: number; amount: number }>> {
  const settled = await Promise.allSettled(
    clubIds.map((id) => getClubBookingTrendReal(id, monthsBack)),
  );

  const totals = new Map<string, { bookings: number; amount: number }>();
  for (const result of settled) {
    if (result.status !== 'fulfilled') continue;
    for (const point of result.value) {
      const cur = totals.get(point.yearMonth) ?? { bookings: 0, amount: 0 };
      cur.bookings += point.bookings;
      cur.amount += point.amount;
      totals.set(point.yearMonth, cur);
    }
  }

  return [...totals.entries()]
    .map(([yearMonth, v]) => ({ yearMonth, ...v }))
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
}

/** Bookings of every club added together. Null when nobody has bookings. */
export function consolidatedBookings(
  byClub: BookingStat[],
  yearMonth: string,
): BookingStat | null {
  if (byClub.length === 0) return null;

  const total = byClub.reduce((acc, b) => acc + b.total, 0);
  const amount = byClub.reduce((acc, b) => acc + b.amount, 0);
  const weekdayDistribution = Array<number>(7).fill(0);
  const hourlyDistribution = Array<number>(24).fill(0);
  for (const b of byClub) {
    b.weekdayDistribution.forEach((v, i) => (weekdayDistribution[i] += v));
    b.hourlyDistribution.forEach((v, i) => (hourlyDistribution[i] += v));
  }

  const occupancyClubs = byClub.filter((b) => b.occupancyRate > 0);

  return {
    clubId: 'consolidado',
    yearMonth,
    total,
    amount,
    avgTicket: total > 0 ? Math.round(amount / total) : 0,
    partnerBookings: byClub.reduce((acc, b) => acc + b.partnerBookings, 0),
    guestBookings: byClub.reduce((acc, b) => acc + b.guestBookings, 0),
    cancelledRate:
      byClub.length > 0
        ? Math.round((byClub.reduce((acc, b) => acc + b.cancelledRate, 0) / byClub.length) * 1000) /
          1000
        : 0,
    occupancyRate:
      occupancyClubs.length > 0
        ? Math.round(
            (occupancyClubs.reduce((acc, b) => acc + b.occupancyRate, 0) / occupancyClubs.length) *
              1000,
          ) / 1000
        : 0,
    byPlace: byClub.flatMap((b) => b.byPlace).sort((a, b) => b.amount - a.amount),
    weekdayDistribution,
    hourlyDistribution,
  };
}

/* ------------------------------------------------------------------ *
 *  Red Link
 * ------------------------------------------------------------------ */

export interface RedLinkResult {
  data: RedLinkSummary | null;
  reason?: string;
}

export async function loadRedLinkSummary(
  clubId: string,
  monthsBack = 6,
): Promise<RedLinkResult> {
  if (!hasClubConnection(clubId)) return { data: null, reason: NO_CONNECTION };
  try {
    return { data: await getRedLinkSummaryReal(clubId, monthsBack) };
  } catch (err) {
    console.error(`[db] redlink query failed for club "${clubId}":`, errorReason(err));
    return { data: null, reason: errorReason(err) };
  }
}

/**
 * Cross-club Red Link view. Clubs without a connection string, or whose query
 * fails, are listed in `excludedClubs` and contribute nothing to the totals.
 */
export async function loadRedLinkConsolidated(monthsBack = 12): Promise<RedLinkConsolidated> {
  const connected = clubs.filter((c) => hasClubConnection(c.id));
  const excludedClubs: Array<{ id: string; reason: string }> = clubs
    .filter((c) => !hasClubConnection(c.id))
    .map((c) => ({ id: c.id, reason: NO_CONNECTION }));

  const settled = await Promise.allSettled(
    connected.map((c) => getRedLinkSummaryReal(c.id, monthsBack)),
  );

  const summaries: RedLinkSummary[] = [];
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') summaries.push(result.value);
    else excludedClubs.push({ id: connected[i].id, reason: errorReason(result.reason) });
  });

  if (summaries.length === 0) {
    return {
      monthsBack,
      fromYearMonth: '',
      toYearMonth: '',
      includedClubs: [],
      excludedClubs,
      totalAmount: 0,
      totalCount: 0,
      avgTicket: 0,
      uniquePartners: 0,
      processedCount: 0,
      reconciliationRate: 0,
      totalFiles: 0,
      automaticFiles: 0,
      automaticShare: 0,
      deniedCount: 0,
      monthly: [],
    };
  }

  const totalAmount = summaries.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCount = summaries.reduce((acc, s) => acc + s.totalCount, 0);
  const processedCount = summaries.reduce((acc, s) => acc + s.processedCount, 0);
  const totalFiles = summaries.reduce((acc, s) => acc + s.totalFiles, 0);
  const automaticFiles = summaries.reduce((acc, s) => acc + s.automaticFiles, 0);

  const monthlyMap = new Map<string, { amount: number; count: number }>();
  for (const s of summaries) {
    for (const p of s.monthly) {
      const cur = monthlyMap.get(p.yearMonth) ?? { amount: 0, count: 0 };
      cur.amount += p.amount;
      cur.count += p.count;
      monthlyMap.set(p.yearMonth, cur);
    }
  }
  const monthly = [...monthlyMap.entries()]
    .map(([yearMonth, v]) => ({ yearMonth, amount: v.amount, count: v.count }))
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

  return {
    monthsBack,
    fromYearMonth: monthly[0]?.yearMonth ?? '',
    toYearMonth: monthly[monthly.length - 1]?.yearMonth ?? '',
    includedClubs: summaries.map((s) => s.clubId),
    excludedClubs,
    totalAmount,
    totalCount,
    avgTicket: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
    uniquePartners: summaries.reduce((acc, s) => acc + s.uniquePartners, 0),
    processedCount,
    reconciliationRate:
      totalCount > 0 ? Math.round((processedCount / totalCount) * 1000) / 1000 : 0,
    totalFiles,
    automaticFiles,
    automaticShare:
      totalFiles > 0 ? Math.round((automaticFiles / totalFiles) * 1000) / 1000 : 0,
    deniedCount: summaries.reduce((acc, s) => acc + s.deniedCount, 0),
    monthly,
  };
}
