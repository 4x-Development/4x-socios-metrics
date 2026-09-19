/**
 * Operational queries: who collects, what is still unpaid, and what failed to
 * sync between a payment gateway and the system.
 *
 * All of it comes from the club's own tables:
 *   - `Receipts` + `Collectors` for the collector ranking.
 *   - `Receipts` (Cancelled = 0) joined to `Liquidations` for debt ageing.
 *   - `PaymentMP` for Mercado Pago payments that never made it onto a receipt.
 */

import sql from 'mssql';
import { getClubPool } from '../pools';
import type { Cashier, OverdueBucket, SyncIssue } from '../../data/types';

interface CashierRow {
  CollectorId: number | null;
  FullName: string | null;
  CollectorType: string | null;
  Count: number;
  Amount: number | null;
}

/**
 * Collector ranking for one period, ordered by amount collected.
 *
 * Note this includes the virtual collectors the system uses for Red Link and
 * Mercado Pago — the caller filters them out via the channel classifier when
 * it wants people only.
 */
export async function getCashiersReal(
  clubId: string,
  yearMonth: string,
): Promise<Cashier[]> {
  const [year, month] = yearMonth.split('-').map(Number);
  const pool = await getClubPool(clubId);

  const result = await pool
    .request()
    .input('year', sql.Int, year)
    .input('month', sql.Int, month)
    .query<CashierRow>(`
      SELECT
        R.CollectorId,
        MAX(ISNULL(C.FullName, R.CollectorFullName)) AS FullName,
        MAX(R.CollectorType) AS CollectorType,
        COUNT(*) AS Count,
        ISNULL(SUM(R.PaymentAmount), 0) AS Amount
      FROM dbo.Receipts R
      LEFT JOIN dbo.Collectors C ON C.Id = R.CollectorId
      WHERE R.Cancelled = 1
        AND R.PaymentDate IS NOT NULL
        AND YEAR(R.PaymentDate) = @year
        AND MONTH(R.PaymentDate) = @month
      GROUP BY R.CollectorId
      ORDER BY SUM(R.PaymentAmount) DESC
    `);

  return result.recordset
    .filter((r) => r.CollectorId != null)
    .map((r) => ({
      id: `${clubId}-${r.CollectorId}`,
      name: r.FullName?.trim() || `Cobrador ${r.CollectorId}`,
      clubId,
      collectionsCount: r.Count,
      amount: Math.round(Number(r.Amount ?? 0)),
    }));
}

interface AgeingRow {
  Bucket: string;
  Count: number;
  Amount: number | null;
}

/**
 * Outstanding debt split by how old it is, measured from the first due date of
 * the liquidation the receipt belongs to.
 */
export async function getOverdueBucketsReal(clubId: string): Promise<OverdueBucket[]> {
  const pool = await getClubPool(clubId);

  const result = await pool.request().query<AgeingRow>(`
    ;WITH Unpaid AS (
      SELECT
        ISNULL(R.TotalToPayWithSurcharge, R.TotalToPay) AS Amount,
        DATEDIFF(DAY, ISNULL(L.FirstExpirationDate, L.LiquidationDate), GETDATE()) AS Age
      FROM dbo.Receipts R
      INNER JOIN dbo.Liquidations L ON L.Id = R.LiquidationId
      INNER JOIN dbo.Partners P ON P.Id = R.PartnerId
      WHERE R.Cancelled = 0
        AND (P.DropDate IS NULL)
    )
    SELECT
      CASE
        WHEN Age <= 0 THEN 'Al dia'
        WHEN Age BETWEEN 1 AND 30 THEN '1-30 dias'
        WHEN Age BETWEEN 31 AND 60 THEN '31-60 dias'
        WHEN Age BETWEEN 61 AND 90 THEN '61-90 dias'
        ELSE '90+ dias'
      END AS Bucket,
      COUNT(*) AS Count,
      ISNULL(SUM(Amount), 0) AS Amount
    FROM Unpaid
    GROUP BY
      CASE
        WHEN Age <= 0 THEN 'Al dia'
        WHEN Age BETWEEN 1 AND 30 THEN '1-30 dias'
        WHEN Age BETWEEN 31 AND 60 THEN '31-60 dias'
        WHEN Age BETWEEN 61 AND 90 THEN '61-90 dias'
        ELSE '90+ dias'
      END
  `);

  // Fixed order so the chart reads left to right regardless of what SQL returns.
  const order = ['1-30 dias', '31-60 dias', '61-90 dias', '90+ dias'];
  const labels: Record<string, string> = {
    '1-30 dias': '1-30 días',
    '31-60 dias': '31-60 días',
    '61-90 dias': '61-90 días',
    '90+ dias': '90+ días',
  };

  return order.map((bucket) => {
    const row = result.recordset.find((r) => r.Bucket === bucket);
    return {
      label: labels[bucket],
      count: row?.Count ?? 0,
      amount: Math.round(Number(row?.Amount ?? 0)),
    };
  });
}

interface SyncRow {
  PendingCount: number;
  OldestAt: Date | null;
}

/**
 * Mercado Pago payments that were approved but never landed on a receipt.
 * Returns null when the club has no Mercado Pago activity at all.
 */
export async function getSyncIssuesReal(clubId: string): Promise<SyncIssue | null> {
  const pool = await getClubPool(clubId);

  const anyMP = await pool
    .request()
    .query<{ Total: number }>(`SELECT COUNT(*) AS Total FROM dbo.PaymentMP`);
  if ((anyMP.recordset[0]?.Total ?? 0) === 0) return null;

  const result = await pool.request().query<SyncRow>(`
    SELECT
      COUNT(*) AS PendingCount,
      MIN(MP.DateCreation) AS OldestAt
    FROM dbo.PaymentMP MP
    WHERE MP.Status = 'approved'
      AND ISNULL(MP.SynchronizedReceipt, 0) = 0
  `);

  const row = result.recordset[0];
  if (!row || row.PendingCount === 0) return null;

  return {
    clubId,
    channel: 'mercado-pago',
    pendingCount: row.PendingCount,
    oldestAt: row.OldestAt ? new Date(row.OldestAt).toISOString() : '',
  };
}
