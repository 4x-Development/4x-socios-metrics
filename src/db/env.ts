/**
 * Server-side environment reader.
 *
 * Connection strings must never reach the browser, so they are deliberately
 * NOT exposed through `import.meta.env` (Astro only surfaces `PUBLIC_`-prefixed
 * variables there, and widening that prefix would risk inlining a password
 * into a client bundle). Instead we read `process.env` and, for local
 * development, parse the project's `.env` file directly.
 *
 * This module only ever runs on the server: importing it from a client
 * component fails at build time on `node:fs`, which is the intended signal.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let fileCache: Record<string, string> | null = null;

function parseEnvFile(contents: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    // Strip matching surrounding quotes, if any.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) out[key] = value;
  }
  return out;
}

function envFile(): Record<string, string> {
  if (fileCache) return fileCache;

  fileCache = {};
  for (const name of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    // Earlier files win: .env.local overrides .env.
    fileCache = { ...parseEnvFile(readFileSync(path, 'utf8')), ...fileCache };
  }
  return fileCache;
}

/**
 * Value of an environment variable, taken from the real environment first and
 * from the local `.env` file second. In hosting, set them as platform secrets
 * and no file is read.
 */
export function readEnv(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  return envFile()[name] || undefined;
}

/** Numeric variant with a fallback, for pool sizes and timeouts. */
export function readEnvNumber(name: string, fallback: number): number {
  const raw = readEnv(name);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}
