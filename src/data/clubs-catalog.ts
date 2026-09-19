/**
 * Public catalog of clubs the dashboard knows about.
 *
 * No secrets in this file — only metadata.
 * The connection string for each club lives in an env var whose name is in `envVar`.
 *
 * To add a new club:
 *   1. Add an entry below.
 *   2. Add an env var in .env (local) or in the hosting platform's secret manager (prod).
 *   3. Restart the dev server / redeploy.
 */

export interface ClubConfig {
  /** Stable identifier used in URLs (`/clubes/:id`) and to look up data. */
  id: string;
  /** Full display name. */
  name: string;
  /** Short display name for table cells, sidebars, headers. */
  shortName: string;
  /** City — used as small label under the name. */
  city: string;
  /** Name of the environment variable that holds the connection string. */
  envVar: string;
  /** When false, the club is in the catalog but skipped at query time. */
  active: boolean;
}

export const clubsCatalog: ClubConfig[] = [
  {
    id: 'social',
    name: 'Club Social Dolores',
    shortName: 'Social Dolores',
    city: 'Dolores',
    envVar: 'DB_CONN_SOCIAL',
    active: true,
  },
  {
    id: 'ferro',
    name: 'Club Ferro Carril Oeste Dolores',
    shortName: 'Club Ferro',
    city: 'Dolores',
    envVar: 'DB_CONN_FERRO',
    active: true,
  },
  {
    id: 'social-dep',
    name: 'Club Social y Deportivo Dolores',
    shortName: 'Social y Deportivo',
    city: 'Dolores',
    envVar: 'DB_CONN_SOCIAL_DEP',
    active: true,
  },
  {
    id: 'sarmiento',
    name: 'Club Sarmiento Dolores',
    shortName: 'Sarmiento',
    city: 'Dolores',
    envVar: 'DB_CONN_SARMIENTO',
    active: true,
  },
  {
    id: 'independiente',
    name: 'Club Independiente Dolores',
    shortName: 'Independiente',
    city: 'Dolores',
    envVar: 'DB_CONN_INDEPENDIENTE',
    active: true,
  },
  {
    id: 'naytuel',
    name: 'Club Naytuel',
    shortName: 'Naytuel',
    city: 'Carmen de Patagones',
    envVar: 'DB_CONN_NAYTUEL',
    active: true,
  },
  {
    id: 'ifc-castelli',
    name: 'IFC Castelli',
    shortName: 'IFC Castelli',
    city: 'Castelli',
    envVar: 'DB_CONN_IFC_CASTELLI',
    active: true,
  },
  {
    id: 'cai',
    name: 'Club Atlético Independiente',
    shortName: 'CAI',
    city: 'Avellaneda',
    envVar: 'DB_CONN_CAI',
    active: true,
  },
];

export function getClubConfig(clubId: string): ClubConfig | undefined {
  return clubsCatalog.find((c) => c.id === clubId);
}

export function getActiveClubs(): ClubConfig[] {
  return clubsCatalog.filter((c) => c.active);
}
