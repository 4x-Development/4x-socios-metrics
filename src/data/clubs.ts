/**
 * Clubs the dashboard can show, derived from the catalog.
 *
 * A club is listed here whether or not its DB is reachable; the data layer is
 * the one that decides if it contributes numbers. Nothing in this module talks
 * to a database.
 */

import { clubsCatalog, getClubConfig } from './clubs-catalog';
import type { Club } from './types';

export const clubs: Club[] = clubsCatalog
  .filter((c) => c.active)
  .map((c) => ({ id: c.id, name: c.name, shortName: c.shortName, city: c.city }));

export function getClub(clubId: string): Club | undefined {
  return clubs.find((c) => c.id === clubId);
}

export function clubName(clubId: string): string {
  return getClub(clubId)?.shortName ?? getClubConfig(clubId)?.shortName ?? clubId;
}
