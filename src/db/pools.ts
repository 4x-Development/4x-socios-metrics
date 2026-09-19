/**
 * Connection pool manager for SQL Server.
 *
 * One pool per club, cached for the life of the process.
 * Astro server runtime keeps this module loaded, so the pool is reused
 * across requests.
 *
 * Each connection string is read from the env var declared in the catalog.
 * DBs may live in different servers — we don't assume a shared host.
 */

import sql from 'mssql';
import { getActiveClubs, getClubConfig, type ClubConfig } from '../data/clubs-catalog';
import { readEnv, readEnvNumber } from './env';

const pools = new Map<string, sql.ConnectionPool>();

/**
 * True when a specific club has its connection string configured.
 * A club without one contributes no data and is listed as excluded.
 */
export function hasClubConnection(clubId: string): boolean {
  const cfg = getClubConfig(clubId);
  if (!cfg) return false;
  return !!readEnv(cfg.envVar);
}

/**
 * List of clubs that are missing their connection string in env.
 * Surfaced by the UI as a warning.
 */
export function missingConnections(): ClubConfig[] {
  return getActiveClubs().filter((c) => !readEnv(c.envVar));
}

/**
 * Parse a standard SQL Server connection string into a node-mssql config object.
 * Accepts the format produced by SQL Server Management Studio and the .NET
 * connection string builder.
 *
 * Supported keys (case-insensitive):
 *   Server / Data Source            — host (optionally "host,port")
 *   Database / Initial Catalog      — database name
 *   User Id / Uid                   — user
 *   Password / Pwd                  — password
 *   Encrypt                         — bool, default true
 *   TrustServerCertificate          — bool, default false
 *   Connection Timeout              — seconds
 */
function parseConnectionString(s: string): sql.config {
  const parts: Record<string, string> = {};
  for (const segment of s.split(';')) {
    const [rawKey, ...rest] = segment.split('=');
    if (!rawKey || rest.length === 0) continue;
    parts[rawKey.trim().toLowerCase()] = rest.join('=').trim();
  }

  const serverRaw = parts['server'] || parts['data source'];
  if (!serverRaw) {
    throw new Error('Connection string is missing "Server" (or "Data Source") property.');
  }

  // Handle "Server=host,1433" SQL Server convention.
  let server = serverRaw;
  let port: number | undefined;
  if (serverRaw.includes(',')) {
    const [host, portStr] = serverRaw.split(',');
    server = host.trim();
    const parsed = Number.parseInt(portStr.trim(), 10);
    if (!Number.isNaN(parsed)) port = parsed;
  }

  const encrypt = (parts['encrypt'] ?? 'true').toLowerCase() === 'true';
  const trustServerCertificate =
    (parts['trustservercertificate'] ?? 'false').toLowerCase() === 'true';

  return {
    server,
    port,
    database: parts['database'] || parts['initial catalog'] || '',
    user: parts['user id'] || parts['uid'] || '',
    password: parts['password'] || parts['pwd'] || '',
    options: {
      encrypt,
      trustServerCertificate,
    },
    connectionTimeout: parts['connection timeout']
      ? Number.parseInt(parts['connection timeout'], 10) * 1000
      : undefined,
  };
}

/**
 * Get (or open) the SQL Server pool for a given club.
 * Throws if the club isn't in the catalog or has no connection string configured.
 */
export async function getClubPool(clubId: string): Promise<sql.ConnectionPool> {
  const cached = pools.get(clubId);
  if (cached && cached.connected) return cached;

  const cfg = getClubConfig(clubId);
  if (!cfg) throw new Error(`Unknown club: ${clubId}`);

  const connStr = readEnv(cfg.envVar);
  if (!connStr) {
    throw new Error(
      `Missing env var "${cfg.envVar}" for club "${clubId}". Add it to .env or the hosting secret manager.`,
    );
  }

  const poolMax = readEnvNumber('DB_POOL_MAX', 5);
  const queryTimeout = readEnvNumber('DB_QUERY_TIMEOUT_MS', 15000);

  const config = parseConnectionString(connStr);
  config.pool = { max: poolMax, min: 0, idleTimeoutMillis: 30000 };
  config.requestTimeout = queryTimeout;

  const pool = new sql.ConnectionPool(config);

  // Surface connection errors with a friendlier message that includes the club id.
  pool.on('error', (err) => {
    console.error(`[db] pool error for club "${clubId}":`, err.message);
  });

  await pool.connect();
  pools.set(clubId, pool);
  return pool;
}

/**
 * Close all pools. Useful for graceful shutdown or test teardown.
 */
export async function closeAllPools(): Promise<void> {
  const tasks: Promise<void>[] = [];
  for (const [, pool] of pools) {
    tasks.push(pool.close());
  }
  pools.clear();
  await Promise.all(tasks);
}
