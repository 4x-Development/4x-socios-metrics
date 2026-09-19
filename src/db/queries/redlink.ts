/**
 * Red Link queries: collections received from Red Link over the last N months.
 *
 * Sources:
 *   - ExtractRedLink / ExtractRedLinkDetail → payments effectively received.
 *   - RefreshRedLinkDetail.Denied → total rejections in debt files sent to RL.
 *
 * Scope decision: this section shows the inbound flow (Red Link → club). We do
 * NOT surface a detail row table or per-concept breakdown; only aggregates.
 *
 * Filter date: `ExtractRedLinkDetail.PaymentDate` (when RL recorded the
 * payment) is the most meaningful for "cobros de los últimos N meses".
 */

import sql from 'mssql';
import { getClubPool } from '../pools';
import type { RedLinkSummary } from '../../data/types';

interface Window {
  from: Date;
  to: Date;
  fromYM: string;
  toYM: string;
  months: string[];
}

function periodFromMonthsBack(n: number, now = new Date()): Window {
  const fromYear = now.getFullYear();
  const fromMonth = now.getMonth();
  const from = new Date(fromYear, fromMonth - (n - 1), 1);
  const to = new Date(fromYear, fromMonth + 1, 1); // first day of next month, exclusive
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(fromYear, fromMonth - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return { from, to, fromYM: months[0], toYM: months[months.length - 1], months };
}

interface AggregatesRow {
  TotalCount: number | null;
  TotalAmount: number | null;
  UniquePartners: number | null;
  ProcessedCount: number | null;
}

interface MonthlyRow {
  Y: number;
  M: number;
  Amount: number;
  Count: number;
}

interface WeekdayRow {
  Weekday: number;
  Count: number;
}

interface HourRow {
  Hour: number;
  Count: number;
}

interface FilesRow {
  TotalFiles: number | null;
  AutomaticFiles: number | null;
}

interface DeniedRow {
  DeniedCount: number | null;
}

export async function getRedLinkSummaryReal(
  clubId: string,
  monthsBack = 6,
): Promise<RedLinkSummary> {
  const window = periodFromMonthsBack(monthsBack);
  const pool = await getClubPool(clubId);

  const inputs = () =>
    pool.request().input('fromDate', sql.Date, window.from).input('toDate', sql.Date, window.to);

  // 1. Aggregated totals from ExtractRedLinkDetail
  const aggregatesResult = await inputs().query<AggregatesRow>(`
    SELECT
      COUNT(*) AS TotalCount,
      SUM(D.PaymentAmount) AS TotalAmount,
      COUNT(DISTINCT D.PartnerId) AS UniquePartners,
      SUM(CASE WHEN D.Processed = 1 THEN 1 ELSE 0 END) AS ProcessedCount
    FROM dbo.ExtractRedLinkDetail D
    WHERE D.PaymentDate >= @fromDate AND D.PaymentDate < @toDate
  `);

  // 2. Monthly breakdown
  const monthlyResult = await inputs().query<MonthlyRow>(`
    SELECT
      YEAR(D.PaymentDate) AS Y,
      MONTH(D.PaymentDate) AS M,
      ISNULL(SUM(D.PaymentAmount), 0) AS Amount,
      COUNT(*) AS Count
    FROM dbo.ExtractRedLinkDetail D
    WHERE D.PaymentDate >= @fromDate AND D.PaymentDate < @toDate
    GROUP BY YEAR(D.PaymentDate), MONTH(D.PaymentDate)
    ORDER BY YEAR(D.PaymentDate), MONTH(D.PaymentDate)
  `);

  // 3. Weekday distribution
  // Normalize to 0=Sunday..6=Saturday regardless of @@DATEFIRST setting.
  const weekdayResult = await inputs().query<WeekdayRow>(`
    SELECT
      ((DATEPART(WEEKDAY, D.PaymentDate) + @@DATEFIRST - 1) % 7) AS Weekday,
      COUNT(*) AS Count
    FROM dbo.ExtractRedLinkDetail D
    WHERE D.PaymentDate >= @fromDate AND D.PaymentDate < @toDate
    GROUP BY ((DATEPART(WEEKDAY, D.PaymentDate) + @@DATEFIRST - 1) % 7)
  `);

  // 4. Hourly distribution
  const hourResult = await inputs().query<HourRow>(`
    SELECT
      DATEPART(HOUR, D.PaymentDate) AS Hour,
      COUNT(*) AS Count
    FROM dbo.ExtractRedLinkDetail D
    WHERE D.PaymentDate >= @fromDate AND D.PaymentDate < @toDate
    GROUP BY DATEPART(HOUR, D.PaymentDate)
  `);

  // 5. Files imported (ExtractRedLink headers)
  const filesResult = await inputs().query<FilesRow>(`
    SELECT
      COUNT(*) AS TotalFiles,
      SUM(CASE WHEN E.Automatic = 1 THEN 1 ELSE 0 END) AS AutomaticFiles
    FROM dbo.ExtractRedLink E
    WHERE E.ExtractDate >= @fromDate AND E.ExtractDate < @toDate
  `);

  // 6. Denied rows in refresh files (rechazos)
  const deniedResult = await inputs().query<DeniedRow>(`
    SELECT COUNT(*) AS DeniedCount
    FROM dbo.RefreshRedLinkDetail RD
    INNER JOIN dbo.RefreshRedLink R ON R.Id = RD.RefreshId
    WHERE RD.Denied = 1
      AND R.RefreshDate >= @fromDate AND R.RefreshDate < @toDate
  `);

  // Assemble
  const agg = aggregatesResult.recordset[0];
  const totalCount = Number(agg?.TotalCount ?? 0);
  const totalAmount = Math.round(Number(agg?.TotalAmount ?? 0));
  const processedCount = Number(agg?.ProcessedCount ?? 0);
  const uniquePartners = Number(agg?.UniquePartners ?? 0);

  const monthlyMap = new Map<string, { amount: number; count: number }>();
  for (const row of monthlyResult.recordset) {
    monthlyMap.set(`${row.Y}-${String(row.M).padStart(2, '0')}`, {
      amount: Math.round(Number(row.Amount)),
      count: Number(row.Count),
    });
  }
  const monthly = window.months.map((ym) => ({
    yearMonth: ym,
    amount: monthlyMap.get(ym)?.amount ?? 0,
    count: monthlyMap.get(ym)?.count ?? 0,
  }));

  const weekdayDistribution = new Array(7).fill(0);
  for (const row of weekdayResult.recordset) {
    if (row.Weekday >= 0 && row.Weekday < 7) weekdayDistribution[row.Weekday] = Number(row.Count);
  }

  const hourlyDistribution = new Array(24).fill(0);
  for (const row of hourResult.recordset) {
    if (row.Hour >= 0 && row.Hour < 24) hourlyDistribution[row.Hour] = Number(row.Count);
  }

  const files = filesResult.recordset[0];
  const totalFiles = Number(files?.TotalFiles ?? 0);
  const automaticFiles = Number(files?.AutomaticFiles ?? 0);

  const deniedCount = Number(deniedResult.recordset[0]?.DeniedCount ?? 0);

  return {
    clubId,
    fromYearMonth: window.fromYM,
    toYearMonth: window.toYM,
    monthsBack,
    totalAmount,
    totalCount,
    avgTicket: totalCount > 0 ? Math.round(totalAmount / totalCount) : 0,
    uniquePartners,
    processedCount,
    reconciliationRate:
      totalCount > 0 ? Math.round((processedCount / totalCount) * 1000) / 1000 : 0,
    totalFiles,
    automaticFiles,
    automaticShare:
      totalFiles > 0 ? Math.round((automaticFiles / totalFiles) * 1000) / 1000 : 0,
    deniedCount,
    monthly,
    weekdayDistribution,
    hourlyDistribution,
  };
}
