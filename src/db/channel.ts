/**
 * Payment channel classification for a Receipt.
 *
 * The real schema does NOT have a single "channel" column. The channel
 * is inferred from a combination of:
 *
 *   - `Applications.CollectorIdMP` → the "virtual" collector id used for Mercado Pago.
 *   - `SettingRedLink.CollectorId` → the "virtual" collector id used for Red Link.
 *   - `Receipts.CollectorType` ∈ { 'Collector', 'CollectorPoint', NULL }.
 *
 * Algorithm:
 *   1. If `Receipts.CollectorId` matches `Applications.CollectorIdMP` → 'mercado-pago'.
 *   2. Else if `Receipts.CollectorId` matches any `SettingRedLink.CollectorId` → 'red-link'.
 *   3. Else if `CollectorType = 'CollectorPoint'` → 'punto-cobro'.
 *   4. Else if `CollectorType = 'Collector'` → 'cobrador'.
 *   5. Else (NULL or other) → null (unclassified / unpaid).
 *
 * This module exposes:
 *   - A SQL fragment that materializes the channel for use in aggregation queries.
 *   - A pure TS classifier for when we already have the rows in memory.
 */

import type { PaymentChannel } from '../data/types';

export interface ChannelClassifierConfig {
  /** Value of Applications.CollectorIdMP (one row per DB). */
  collectorIdMP: number | null;
  /** Set of CollectorId values used by Red Link settings. */
  redLinkCollectorIds: Set<number>;
}

export interface ReceiptRowForClassification {
  CollectorId: number | null;
  CollectorType: string | null; // 'Collector' | 'CollectorPoint' | null
}

/**
 * Classify a single receipt row. Returns null when the receipt is unpaid or
 * the channel can't be determined.
 */
export function classifyChannel(
  row: ReceiptRowForClassification,
  cfg: ChannelClassifierConfig,
): PaymentChannel | null {
  if (row.CollectorId != null) {
    if (cfg.collectorIdMP != null && row.CollectorId === cfg.collectorIdMP) {
      return 'mercado-pago';
    }
    if (cfg.redLinkCollectorIds.has(row.CollectorId)) {
      return 'red-link';
    }
  }
  if (row.CollectorType === 'CollectorPoint') return 'punto-cobro';
  if (row.CollectorType === 'Collector') return 'cobrador';
  return null;
}

/**
 * Build a SQL CASE expression that returns the channel for each row.
 * Inline values for the MP id and Red Link ids so the expression is self-contained.
 *
 * Usage in a query:
 *   SELECT ${channelCaseSql(cfg)} AS Channel, SUM(...) ...
 *   FROM Receipts WHERE PaymentDate IS NOT NULL ...
 */
export function channelCaseSql(cfg: ChannelClassifierConfig): string {
  const rlIds = [...cfg.redLinkCollectorIds];
  const mpClause =
    cfg.collectorIdMP != null
      ? `WHEN R.CollectorId = ${cfg.collectorIdMP} THEN 'mercado-pago'`
      : '';
  const rlClause =
    rlIds.length > 0
      ? `WHEN R.CollectorId IN (${rlIds.join(',')}) THEN 'red-link'`
      : '';

  return `
    CASE
      ${mpClause}
      ${rlClause}
      WHEN R.CollectorType = 'CollectorPoint' THEN 'punto-cobro'
      WHEN R.CollectorType = 'Collector' THEN 'cobrador'
      ELSE NULL
    END`.replace(/\s+/g, ' ').trim();
}

/**
 * Load the classifier config from a club's DB.
 * Reads Applications.CollectorIdMP and SettingRedLink.CollectorId.
 */
export async function loadClassifierConfig(
  request: { query: (s: string) => Promise<{ recordset: unknown[] }> },
): Promise<ChannelClassifierConfig> {
  const appResult = await request.query(
    `SELECT TOP 1 CollectorIdMP FROM dbo.Applications`,
  );
  const collectorIdMP = (appResult.recordset[0] as { CollectorIdMP: number | null } | undefined)?.CollectorIdMP ?? null;

  const rlResult = await request.query(
    `SELECT DISTINCT CollectorId FROM dbo.SettingRedLink WHERE CollectorId IS NOT NULL`,
  );
  const redLinkCollectorIds = new Set<number>(
    (rlResult.recordset as Array<{ CollectorId: number }>).map((r) => r.CollectorId),
  );

  return { collectorIdMP, redLinkCollectorIds };
}
