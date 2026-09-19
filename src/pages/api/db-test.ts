/**
 * Diagnostic endpoint to validate the SQL Server connection per club.
 *
 * GET /api/db-test
 *
 * For every club in the catalog:
 *   - Checks if its env var is configured.
 *   - If yes, opens the pool and runs `SELECT OrganizationName, ManageMP, ManageRedLink FROM Applications`.
 *   - Returns per-club status (ok / skip / error) with the error message when it fails.
 *
 * Use this to confirm credentials, network reachability and schema before
 * wiring the rest of the dashboard to real data.
 */

import type { APIRoute } from 'astro';
import { clubsCatalog } from '@data/clubs-catalog';
import { hasClubConnection, getClubPool } from '@db/pools';

// Note: in dev (`npm run dev`) this endpoint runs at request time and queries live DBs.
// At build time with `output: 'static'`, Astro tries to prerender it (which calls
// the DB once at build). For live data in production, switch astro.config.mjs to
// `output: 'server'` with @astrojs/node and add `export const prerender = false;` here.

interface ClubTestResult {
  id: string;
  name: string;
  envVar: string;
  envVarSet: boolean;
  status: 'ok' | 'skip' | 'error';
  message?: string;
  durationMs?: number;
  sample?: unknown;
}

export const GET: APIRoute = async () => {
  const startedAt = Date.now();

  const results: ClubTestResult[] = [];

  for (const club of clubsCatalog) {
    const envVarSet = hasClubConnection(club.id);

    if (!envVarSet) {
      results.push({
        id: club.id,
        name: club.name,
        envVar: club.envVar,
        envVarSet: false,
        status: 'skip',
        message: `Falta la env var ${club.envVar} en .env`,
      });
      continue;
    }

    const t0 = Date.now();
    try {
      const pool = await getClubPool(club.id);
      const result = await pool.request().query<{
        OrganizationName: string | null;
        ManageMP: boolean | null;
        ManageRedLink: boolean | null;
      }>(`SELECT TOP 1 OrganizationName, ManageMP, ManageRedLink FROM dbo.Applications`);

      const row = result.recordset[0];
      results.push({
        id: club.id,
        name: club.name,
        envVar: club.envVar,
        envVarSet: true,
        status: 'ok',
        durationMs: Date.now() - t0,
        sample: row ?? null,
      });
    } catch (err) {
      results.push({
        id: club.id,
        name: club.name,
        envVar: club.envVar,
        envVarSet: true,
        status: 'error',
        durationMs: Date.now() - t0,
        message: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      });
    }
  }

  const summary = {
    ok: results.filter((r) => r.status === 'ok').length,
    skip: results.filter((r) => r.status === 'skip').length,
    error: results.filter((r) => r.status === 'error').length,
  };

  return new Response(
    JSON.stringify(
      {
        summary,
        totalDurationMs: Date.now() - startedAt,
        results,
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
};
