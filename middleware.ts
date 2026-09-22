/**
 * Access control for the dashboard, enforced at Vercel's edge before any page
 * is served.
 *
 * The dashboard shows the collection figures of every club, so it must never
 * be reachable by URL alone. This middleware asks for HTTP Basic credentials
 * on every request — pages, assets and the sitemap included.
 *
 * Credentials live in the `DASHBOARD_USERS` environment variable (set it in
 * Vercel → Settings → Environment Variables), one pair per person:
 *
 *   DASHBOARD_USERS="leandro:una-clave-larga,miguel:otra-clave-larga"
 *
 * Adding or removing a person is editing that variable and redeploying; there
 * is no user database to maintain.
 *
 * Fails closed on purpose: if the variable is missing or malformed, nobody
 * gets in. A misconfigured deployment leaves the data unreachable rather than
 * public.
 */

import { next } from '@vercel/functions';

const REALM = 'Metricas 4x';

/** Rejects the request and makes the browser show its credentials prompt. */
function unauthorized(): Response {
  return new Response('Acceso restringido.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

/**
 * Compares two strings in time independent of how many characters match, so a
 * response time can't be used to guess a password character by character.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Parses `user:pass,user2:pass2` into pairs, ignoring malformed entries. */
function allowedCredentials(): Array<{ user: string; password: string }> {
  const raw = process.env.DASHBOARD_USERS;
  if (!raw) return [];

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf(':');
      if (separator <= 0) return null;
      return {
        user: entry.slice(0, separator).trim(),
        password: entry.slice(separator + 1),
      };
    })
    .filter((pair): pair is { user: string; password: string } => pair !== null && pair.password.length > 0);
}

export default function middleware(request: Request): Response {
  const accounts = allowedCredentials();
  if (accounts.length === 0) {
    console.error('[auth] DASHBOARD_USERS sin configurar: se rechaza todo el tráfico.');
    return unauthorized();
  }

  const header = request.headers.get('authorization');
  if (!header?.startsWith('Basic ')) return unauthorized();

  let decoded: string;
  try {
    decoded = atob(header.slice('Basic '.length));
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(':');
  if (separator <= 0) return unauthorized();

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  const authenticated = accounts.some(
    (account) => safeEqual(account.user, user) && safeEqual(account.password, password),
  );
  if (!authenticated) return unauthorized();

  // Authenticated: serve the page, and keep it out of search engines even if
  // the URL ever leaks.
  return next({
    headers: {
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'private, no-store',
    },
  });
}

// Runs on everything: pages, assets and any file under /dist.
export const config = {
  matcher: '/:path*',
};
