/**
 * Collections queries against a club's real SQL Server DB.
 *
 * They produce `ChannelStat[]`, the shape the dashboard components consume.
 *
 * Note: these queries are not wired into the pages yet — the dashboard is
 */

import sql from 'mssql';
import { getClubPool } from '../pools';
import { channelCaseSql, loadClassifierConfig } from '../channel';
import type { ChannelStat, PaymentChannel } from '../../data/types';

interface ByChannelRow {
  Channel: PaymentChannel | null;
  Count: number;
  Amount: number;
  AvgTicket: number;
  AvgDaysToCollect: number;
  AdoptionCount: number;
}

/**
 * Returns the collections breakdown by channel for a club & period.
 *
 * @param clubId  - id from clubs-catalog
 * @param year    - calendar year (e.g. 2026)
 * @param month   - 1..12
 */
export async function getByChannelForPeriod(
  clubId: string,
  year: number,
  month: number,
): Promise<ChannelStat[]> {
  const pool = await getClubPool(clubId);
  const cfg = await loadClassifierConfig(pool.request());
  const channelExpr = channelCaseSql(cfg);

  // Pull all rows for the period, classified by channel.
  // We cross with Liquidations to get the issue date for time-to-collect.
  const result = await pool
    .request()
    .input('year', sql.Int, year)
    .input('month', sql.Int, month)
    .query<ByChannelRow>(`
      SELECT
        ${channelExpr} AS Channel,
        COUNT(*) AS Count,
        ISNULL(SUM(R.PaymentAmount), 0) AS Amount,
        ISNULL(AVG(R.PaymentAmount), 0) AS AvgTicket,
        ISNULL(AVG(CAST(DATEDIFF(DAY, L.FirstExpirationDate, R.PaymentDate) AS DECIMAL(18, 2))), 0) AS AvgDaysToCollect,
        COUNT(DISTINCT R.PartnerId) AS AdoptionCount
      FROM dbo.Receipts R
      INNER JOIN dbo.Liquidations L ON L.Id = R.LiquidationId
      WHERE R.Cancelled = 1
        AND R.PaymentDate IS NOT NULL
        AND L.PeriodYear = @year
        AND L.PeriodMonth = @month
      GROUP BY ${channelExpr}
    `);

  // Compute totals to derive adoption rate (% of unique payers per channel
  // over total unique payers in the period).
  const totalUniquePayersResult = await pool
    .request()
    .input('year', sql.Int, year)
    .input('month', sql.Int, month)
    .query<{ Total: number }>(`
      SELECT COUNT(DISTINCT R.PartnerId) AS Total
      FROM dbo.Receipts R
      INNER JOIN dbo.Liquidations L ON L.Id = R.LiquidationId
      WHERE R.Cancelled = 1
        AND R.PaymentDate IS NOT NULL
        AND L.PeriodYear = @year
        AND L.PeriodMonth = @month
    `);
  const totalUniquePayers = totalUniquePayersResult.recordset[0]?.Total ?? 0;

  return result.recordset
    .filter((row) => row.Channel !== null)
    .map((row) => ({
      channel: row.Channel as PaymentChannel,
      count: row.Count,
      amount: Math.round(Number(row.Amount)),
      avgTicket: Math.round(Number(row.AvgTicket)),
      avgDaysToCollect: Math.round(Number(row.AvgDaysToCollect) * 10) / 10,
      successRate: null, // MP-specific success comes from PaymentMP — see getMPSuccessRate
      adoptionRate:
        totalUniquePayers > 0
          ? Math.round((row.AdoptionCount / totalUniquePayers) * 1000) / 1000
          : 0,
    }));
}

/**
 * Mercado Pago success rate for a given period.
 * Approved payments over total MP attempts (PaymentMP rows).
 */
export async function getMPSuccessRate(
  clubId: string,
  year: number,
  month: number,
): Promise<number> {
  const pool = await getClubPool(clubId);
  const result = await pool
    .request()
    .input('year', sql.Int, year)
    .input('month', sql.Int, month)
    .query<{ Total: number; Approved: number }>(`
      SELECT
        COUNT(*) AS Total,
        SUM(CASE WHEN Status = 'approved' THEN 1 ELSE 0 END) AS Approved
      FROM dbo.PaymentMP
      WHERE YEAR(DateCreation) = @year
        AND MONTH(DateCreation) = @month
    `);
  const r = result.recordset[0];
  if (!r || r.Total === 0) return 0;
  return Math.round((r.Approved / r.Total) * 1000) / 1000;
}
