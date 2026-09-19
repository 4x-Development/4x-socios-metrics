/**
 * Real-data query that produces 12 months of `MonthlyAggregate` for a single club.
 *
 * Runs four parallel queries against the club's SQL Server DB:
 *   1. Membership series (active at end of month, new, resigned, family groups).
 *   2. Collections series (count, amount, ticket, collection rate, overdue, TTC).
 *   3. By-channel series (count, amount, ticket, TTC per channel per month).
 *   4. By-category series (active, collections count, amount, collection rate per type per month).
 *
 * Then assembles the result into a `MonthlyAggregate[]`, one entry per month,
 * which is the only shape the dashboard components know.
 *
 * Note: the queries below favor readability over raw performance. With 12
 * months and a few thousand partners per club, this runs in well under a second.
 * If performance becomes an issue, an indexed materialized table or a
 * consolidated DB is the next step.
 */

import sql from 'mssql';
import { getClubPool } from '../pools';
import { channelCaseSql, loadClassifierConfig } from '../channel';
import type {
  CategoryStat,
  ChannelStat,
  CollectionsStat,
  MemberCategory,
  MembershipStat,
  MonthlyAggregate,
  PaymentChannel,
} from '../../data/types';

// ---------- Helpers ----------

function lastNMonths(n: number, refDate = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

function ymKey(y: number, m: number): string {
  return `${y}-${String(m).padStart(2, '0')}`;
}

function emptyMembership(): MembershipStat {
  return {
    active: 0,
    new: 0,
    resigned: 0,
    net: 0,
    retentionRate: 0,
    familyGroups: 0,
    avgFamilySize: 0,
  };
}

function emptyCollections(): CollectionsStat {
  return {
    count: 0,
    amount: 0,
    issuedCount: 0,
    issuedAmount: 0,
    avgTicket: 0,
    collectionRate: 0,
    amountCollectionRate: 0,
    overdueAmount: 0,
    overdueCount: 0,
    avgDaysToCollect: 0,
  };
}

/**
 * Map partner type ids to one of our canonical MemberCategory buckets.
 *
 * The schema stores arbitrary names per club (`PartnersTypes.Name`) — each
 * club can name their categories however they want. We collapse them into
 * the same five buckets the dashboard uses, so charts don't break per club.
 *
 * Heuristic based on common names; fall back to 'general'.
 */
function categoryFromTypeName(name: string | null): MemberCategory {
  if (!name) return 'general';
  const n = name.toLowerCase();
  if (n.includes('jubil') || n.includes('mayor') || n.includes('vital')) return 'jubilado';
  if (n.includes('cadete') || n.includes('menor') || n.includes('infantil') || n.includes('juvenil')) return 'cadete';
  if (n.includes('famil') || n.includes('grupo')) return 'familiar';
  if (n.includes('premium') || n.includes('vital') || n.includes('plus')) return 'premium';
  return 'general';
}

// ---------- Queries ----------

interface MembershipRow {
  Y: number;
  M: number;
  Active: number;
  NewN: number;
  Resigned: number;
  FamilyGroups: number;
}

async function queryMembershipSeries(
  pool: sql.ConnectionPool,
  months: string[],
): Promise<Map<string, MembershipStat>> {
  // Build a calendar of month-ends. We use SQL Server's EOMONTH for each row
  // and join the Partners table to count active members at that snapshot.
  const monthValues = months
    .map((ym) => {
      const [y, m] = ym.split('-').map(Number);
      return `('${y}-${String(m).padStart(2, '0')}-01')`;
    })
    .join(',');

  const result = await pool.request().query<MembershipRow>(`
    ;WITH MonthList AS (
      SELECT CAST(d AS DATE) AS MonthStart, EOMONTH(d) AS MonthEnd
      FROM (VALUES ${monthValues}) v(d)
    )
    SELECT
      YEAR(ML.MonthEnd) AS Y,
      MONTH(ML.MonthEnd) AS M,
      (SELECT COUNT(*) FROM dbo.Partners P
         WHERE P.AdmissionDate <= ML.MonthEnd
           AND (P.DropDate IS NULL OR P.DropDate > ML.MonthEnd)
      ) AS Active,
      (SELECT COUNT(*) FROM dbo.Partners P
         WHERE P.AdmissionDate BETWEEN ML.MonthStart AND ML.MonthEnd
      ) AS NewN,
      (SELECT COUNT(*) FROM dbo.Partners P
         WHERE P.DropDate IS NOT NULL
           AND P.DropDate BETWEEN ML.MonthStart AND ML.MonthEnd
      ) AS Resigned,
      (SELECT COUNT(DISTINCT PG.Manager) FROM dbo.PartnersGroups PG
         INNER JOIN dbo.Partners P ON P.Id = PG.Manager
         WHERE PG.Active = 1
           AND P.AdmissionDate <= ML.MonthEnd
           AND (P.DropDate IS NULL OR P.DropDate > ML.MonthEnd)
      ) AS FamilyGroups
    FROM MonthList ML
    ORDER BY ML.MonthEnd
  `);

  const map = new Map<string, MembershipStat>();
  for (const row of result.recordset) {
    const net = row.NewN - row.Resigned;
    const retentionRate =
      row.Active > 0 ? Math.round((1 - row.Resigned / row.Active) * 1000) / 1000 : 0;
    map.set(ymKey(row.Y, row.M), {
      active: row.Active,
      new: row.NewN,
      resigned: row.Resigned,
      net,
      retentionRate,
      familyGroups: row.FamilyGroups,
      avgFamilySize: 0, // populated below
    });
  }

  // Avg family size: count distinct Members per Manager, average over groups.
  const sizeResult = await pool.request().query<{ Y: number; M: number; AvgSize: number }>(`
    ;WITH MonthList AS (
      SELECT CAST(d AS DATE) AS MonthStart, EOMONTH(d) AS MonthEnd
      FROM (VALUES ${monthValues}) v(d)
    ),
    ManagerSizes AS (
      SELECT
        YEAR(ML.MonthEnd) AS Y,
        MONTH(ML.MonthEnd) AS M,
        PG.Manager,
        COUNT(DISTINCT PG.Member) + 1 AS GroupSize
      FROM MonthList ML
      INNER JOIN dbo.PartnersGroups PG ON PG.Active = 1
      INNER JOIN dbo.Partners P ON P.Id = PG.Manager
      WHERE P.AdmissionDate <= ML.MonthEnd
        AND (P.DropDate IS NULL OR P.DropDate > ML.MonthEnd)
      GROUP BY ML.MonthEnd, PG.Manager
    )
    SELECT Y, M, AVG(CAST(GroupSize AS DECIMAL(6, 2))) AS AvgSize
    FROM ManagerSizes
    GROUP BY Y, M
  `);
  for (const row of sizeResult.recordset) {
    const stat = map.get(ymKey(row.Y, row.M));
    if (stat) stat.avgFamilySize = Math.round(Number(row.AvgSize) * 10) / 10;
  }

  return map;
}

interface CollectionsRow {
  Y: number;
  M: number;
  PaidCount: number;
  PaidAmount: number;
  OverdueCount: number;
  OverdueAmount: number;
  IssuedCount: number;
  IssuedAmount: number;
  AvgDaysToCollect: number | null;
}

async function queryCollectionsSeries(
  pool: sql.ConnectionPool,
  months: string[],
): Promise<Map<string, CollectionsStat>> {
  const monthValues = months
    .map((ym) => {
      const [y, m] = ym.split('-').map(Number);
      return `(${y}, ${m})`;
    })
    .join(',');

  const result = await pool.request().query<CollectionsRow>(`
    ;WITH Periods AS (
      SELECT Y, M FROM (VALUES ${monthValues}) v(Y, M)
    )
    SELECT
      P.Y,
      P.M,
      ISNULL(SUM(CASE WHEN R.Cancelled = 1 THEN 1 ELSE 0 END), 0) AS PaidCount,
      ISNULL(SUM(CASE WHEN R.Cancelled = 1 THEN R.PaymentAmount ELSE 0 END), 0) AS PaidAmount,
      ISNULL(SUM(CASE WHEN R.Cancelled = 0 THEN 1 ELSE 0 END), 0) AS OverdueCount,
      ISNULL(SUM(CASE WHEN R.Cancelled = 0 THEN ISNULL(R.TotalToPayWithSurcharge, R.TotalToPay) ELSE 0 END), 0) AS OverdueAmount,
      ISNULL(COUNT(R.Id), 0) AS IssuedCount,
      ISNULL(SUM(ISNULL(R.TotalToPay, 0)), 0) AS IssuedAmount,
      AVG(CASE WHEN R.Cancelled = 1 AND R.PaymentDate IS NOT NULL
               THEN CAST(DATEDIFF(DAY, L.FirstExpirationDate, R.PaymentDate) AS DECIMAL(10, 2))
               ELSE NULL
          END) AS AvgDaysToCollect
    FROM Periods P
    LEFT JOIN dbo.Liquidations L ON L.PeriodYear = P.Y AND L.PeriodMonth = P.M
    LEFT JOIN dbo.Receipts R ON R.LiquidationId = L.Id
    GROUP BY P.Y, P.M
    ORDER BY P.Y, P.M
  `);

  const map = new Map<string, CollectionsStat>();
  for (const row of result.recordset) {
    const count = row.PaidCount;
    const amount = Math.round(Number(row.PaidAmount));
    const issuedCount = row.IssuedCount;
    const issuedAmount = Math.round(Number(row.IssuedAmount));
    map.set(ymKey(row.Y, row.M), {
      count,
      amount,
      issuedCount,
      issuedAmount,
      avgTicket: count > 0 ? Math.round(amount / count) : 0,
      collectionRate: issuedCount > 0 ? Math.round((count / issuedCount) * 1000) / 1000 : 0,
      amountCollectionRate:
        issuedAmount > 0 ? Math.round((amount / issuedAmount) * 1000) / 1000 : 0,
      overdueCount: row.OverdueCount,
      overdueAmount: Math.round(Number(row.OverdueAmount)),
      avgDaysToCollect:
        row.AvgDaysToCollect != null ? Math.round(Number(row.AvgDaysToCollect) * 10) / 10 : 0,
    });
  }
  return map;
}

interface ChannelRow {
  Y: number;
  M: number;
  Channel: PaymentChannel | null;
  PaidCount: number;
  PaidAmount: number;
  AvgDaysToCollect: number | null;
  AdoptionCount: number;
}

async function queryByChannelSeries(
  pool: sql.ConnectionPool,
  channelExpr: string,
  months: string[],
): Promise<Map<string, ChannelStat[]>> {
  const monthValues = months
    .map((ym) => {
      const [y, m] = ym.split('-').map(Number);
      return `(${y}, ${m})`;
    })
    .join(',');

  const result = await pool.request().query<ChannelRow>(`
    ;WITH Periods AS (
      SELECT Y, M FROM (VALUES ${monthValues}) v(Y, M)
    )
    SELECT
      L.PeriodYear AS Y,
      L.PeriodMonth AS M,
      ${channelExpr} AS Channel,
      COUNT(*) AS PaidCount,
      SUM(R.PaymentAmount) AS PaidAmount,
      AVG(CAST(DATEDIFF(DAY, L.FirstExpirationDate, R.PaymentDate) AS DECIMAL(10, 2))) AS AvgDaysToCollect,
      COUNT(DISTINCT R.PartnerId) AS AdoptionCount
    FROM dbo.Receipts R
    INNER JOIN dbo.Liquidations L ON L.Id = R.LiquidationId
    INNER JOIN Periods P ON P.Y = L.PeriodYear AND P.M = L.PeriodMonth
    WHERE R.Cancelled = 1
      AND R.PaymentDate IS NOT NULL
    GROUP BY L.PeriodYear, L.PeriodMonth, ${channelExpr}
  `);

  // Adoption denominator: total distinct payers per period (not per channel).
  const adoptionDenResult = await pool.request().query<{ Y: number; M: number; Total: number }>(`
    ;WITH Periods AS (
      SELECT Y, M FROM (VALUES ${monthValues}) v(Y, M)
    )
    SELECT L.PeriodYear AS Y, L.PeriodMonth AS M, COUNT(DISTINCT R.PartnerId) AS Total
    FROM dbo.Receipts R
    INNER JOIN dbo.Liquidations L ON L.Id = R.LiquidationId
    INNER JOIN Periods P ON P.Y = L.PeriodYear AND P.M = L.PeriodMonth
    WHERE R.Cancelled = 1 AND R.PaymentDate IS NOT NULL
    GROUP BY L.PeriodYear, L.PeriodMonth
  `);
  const denMap = new Map<string, number>(
    adoptionDenResult.recordset.map((r) => [ymKey(r.Y, r.M), r.Total]),
  );

  const map = new Map<string, ChannelStat[]>();
  for (const row of result.recordset) {
    if (row.Channel === null) continue; // unclassified
    const key = ymKey(row.Y, row.M);
    const den = denMap.get(key) ?? 0;
    const list = map.get(key) ?? [];
    const amount = Math.round(Number(row.PaidAmount));
    list.push({
      channel: row.Channel,
      count: row.PaidCount,
      amount,
      avgTicket: row.PaidCount > 0 ? Math.round(amount / row.PaidCount) : 0,
      avgDaysToCollect:
        row.AvgDaysToCollect != null ? Math.round(Number(row.AvgDaysToCollect) * 10) / 10 : 0,
      successRate: null, // only Mercado Pago reports attempts; refined below
      adoptionRate: den > 0 ? Math.round((row.AdoptionCount / den) * 1000) / 1000 : 0,
    });
    map.set(key, list);
  }

  // Refine MP success rate per period using PaymentMP.
  const mpSuccess = await pool.request().query<{
    Y: number;
    M: number;
    Total: number;
    Approved: number;
  }>(`
    ;WITH Periods AS (
      SELECT Y, M FROM (VALUES ${monthValues}) v(Y, M)
    )
    SELECT YEAR(MP.DateCreation) AS Y, MONTH(MP.DateCreation) AS M,
           COUNT(*) AS Total,
           SUM(CASE WHEN MP.Status = 'approved' THEN 1 ELSE 0 END) AS Approved
    FROM dbo.PaymentMP MP
    INNER JOIN Periods P ON P.Y = YEAR(MP.DateCreation) AND P.M = MONTH(MP.DateCreation)
    GROUP BY YEAR(MP.DateCreation), MONTH(MP.DateCreation)
  `);
  for (const row of mpSuccess.recordset) {
    const key = ymKey(row.Y, row.M);
    const list = map.get(key);
    if (!list) continue;
    const mp = list.find((c) => c.channel === 'mercado-pago');
    if (mp && row.Total > 0) {
      mp.successRate = Math.round((row.Approved / row.Total) * 1000) / 1000;
    }
  }

  return map;
}

interface CategoryRow {
  Y: number;
  M: number;
  TypeId: number;
  TypeName: string | null;
  Active: number;
  PaidCount: number;
  PaidAmount: number;
}

async function queryByCategorySeries(
  pool: sql.ConnectionPool,
  months: string[],
): Promise<Map<string, CategoryStat[]>> {
  const monthValues = months
    .map((ym) => {
      const [y, m] = ym.split('-').map(Number);
      return `('${y}-${String(m).padStart(2, '0')}-01')`;
    })
    .join(',');

  const result = await pool.request().query<CategoryRow>(`
    ;WITH MonthList AS (
      SELECT CAST(d AS DATE) AS MonthStart, EOMONTH(d) AS MonthEnd
      FROM (VALUES ${monthValues}) v(d)
    )
    SELECT
      YEAR(ML.MonthEnd) AS Y,
      MONTH(ML.MonthEnd) AS M,
      PT.Id AS TypeId,
      PT.Name AS TypeName,
      (SELECT COUNT(*) FROM dbo.Partners P
         WHERE P.PartnerTypeId = PT.Id
           AND P.AdmissionDate <= ML.MonthEnd
           AND (P.DropDate IS NULL OR P.DropDate > ML.MonthEnd)
      ) AS Active,
      ISNULL((SELECT COUNT(*) FROM dbo.Receipts R
         INNER JOIN dbo.Liquidations L ON L.Id = R.LiquidationId
         WHERE R.Cancelled = 1
           AND R.PaymentDate IS NOT NULL
           AND R.PartnerTypeId = PT.Id
           AND L.PeriodYear = YEAR(ML.MonthEnd)
           AND L.PeriodMonth = MONTH(ML.MonthEnd)
      ), 0) AS PaidCount,
      ISNULL((SELECT SUM(R.PaymentAmount) FROM dbo.Receipts R
         INNER JOIN dbo.Liquidations L ON L.Id = R.LiquidationId
         WHERE R.Cancelled = 1
           AND R.PaymentDate IS NOT NULL
           AND R.PartnerTypeId = PT.Id
           AND L.PeriodYear = YEAR(ML.MonthEnd)
           AND L.PeriodMonth = MONTH(ML.MonthEnd)
      ), 0) AS PaidAmount
    FROM MonthList ML
    CROSS JOIN dbo.PartnersTypes PT
    WHERE PT.Active = 1
  `);

  // Roll up to our canonical 5 buckets (general / premium / familiar / jubilado / cadete).
  const map = new Map<string, CategoryStat[]>();
  for (const row of result.recordset) {
    const cat = categoryFromTypeName(row.TypeName);
    const key = ymKey(row.Y, row.M);
    let list = map.get(key);
    if (!list) {
      list = [];
      map.set(key, list);
    }
    let bucket = list.find((c) => c.category === cat);
    if (!bucket) {
      bucket = { category: cat, active: 0, collectionsCount: 0, amount: 0, collectionRate: 0 };
      list.push(bucket);
    }
    bucket.active += row.Active;
    bucket.collectionsCount += row.PaidCount;
    bucket.amount += Math.round(Number(row.PaidAmount));
  }

  for (const list of map.values()) {
    for (const b of list) {
      b.collectionRate = b.active > 0 ? Math.round((b.collectionsCount / b.active) * 1000) / 1000 : 0;
    }
  }

  return map;
}

// ---------- Public ----------

/**
 * Returns 12 months of MonthlyAggregate for the given club, sourced from
 * the club's SQL Server DB. Months are ordered oldest to newest.
 */
export async function getClubMonthlySeriesReal(clubId: string): Promise<MonthlyAggregate[]> {
  const pool = await getClubPool(clubId);
  const cfg = await loadClassifierConfig(pool.request());
  const channelExpr = channelCaseSql(cfg);
  const months = lastNMonths(12);

  const [membership, collections, channels, categories] = await Promise.all([
    queryMembershipSeries(pool, months),
    queryCollectionsSeries(pool, months),
    queryByChannelSeries(pool, channelExpr, months),
    queryByCategorySeries(pool, months),
  ]);

  return months.map((ym) => ({
    clubId,
    yearMonth: ym,
    members: membership.get(ym) ?? emptyMembership(),
    collections: collections.get(ym) ?? emptyCollections(),
    byChannel: channels.get(ym) ?? [],
    byCategory: categories.get(ym) ?? [],
  }));
}
