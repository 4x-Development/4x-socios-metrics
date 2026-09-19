/**
 * Schema shared across queries, lib helpers and components.
 * Every value is sourced from a club's SQL Server DB - there is no mock data.
 */

export type PaymentChannel = 'mercado-pago' | 'red-link' | 'punto-cobro' | 'cobrador';

export const paymentChannelLabels: Record<PaymentChannel, string> = {
  'mercado-pago': 'Mercado Pago',
  'red-link': 'Red Link',
  'punto-cobro': 'Punto de cobro',
  cobrador: 'Cobrador en calle',
};

export const paymentChannelColors: Record<PaymentChannel, string> = {
  'mercado-pago': '#4f70c8',
  'red-link': '#7e9adc',
  'punto-cobro': '#16285c',
  cobrador: '#94a3b8',
};

export type MemberCategory = 'general' | 'premium' | 'familiar' | 'jubilado' | 'cadete';

export const memberCategoryLabels: Record<MemberCategory, string> = {
  general: 'General',
  premium: 'Premium',
  familiar: 'Familiar',
  jubilado: 'Jubilado',
  cadete: 'Cadete',
};

export interface Club {
  id: string;
  name: string;
  shortName: string;
  city: string;
}

export interface ChannelStat {
  channel: PaymentChannel;
  count: number;
  amount: number;
  avgTicket: number;
  /**
   * Average days between the liquidation's first due date and the payment.
   * Negative means the channel collects before the due date.
   */
  avgDaysToCollect: number;
  /**
   * Approved over attempted operations. Only Mercado Pago reports attempts,
   * so every other channel is null and the UI shows nothing rather than 100%.
   */
  successRate: number | null;
  adoptionRate: number;
}

export interface CategoryStat {
  category: MemberCategory;
  active: number;
  collectionsCount: number;
  amount: number;
  collectionRate: number;
}

export interface MembershipStat {
  active: number;
  new: number;
  resigned: number;
  net: number;
  retentionRate: number;
  familyGroups: number;
  avgFamilySize: number;
}

export interface CollectionsStat {
  /** Paid receipts of the period (Receipts.Cancelled = 1). */
  count: number;
  /** Amount actually collected (sum of PaymentAmount). */
  amount: number;
  /** Receipts issued for the period, paid or not. */
  issuedCount: number;
  /** Amount billed for the period (sum of TotalToPay). */
  issuedAmount: number;
  avgTicket: number;
  /** Paid receipts over issued receipts. */
  collectionRate: number;
  /** Collected amount over billed amount - the club's real collection rate. */
  amountCollectionRate: number;
  overdueAmount: number;
  overdueCount: number;
  avgDaysToCollect: number;
}

export interface MonthlyAggregate {
  clubId: string;
  yearMonth: string;
  members: MembershipStat;
  collections: CollectionsStat;
  byChannel: ChannelStat[];
  byCategory: CategoryStat[];
}

export interface Cashier {
  id: string;
  name: string;
  clubId: string;
  collectionsCount: number;
  amount: number;
}

export interface CashierClosing {
  id: string;
  clubId: string;
  cashierId: string;
  closedAt: string;
  amount: number;
  ticketCount: number;
}

export interface SyncIssue {
  clubId: string;
  channel: PaymentChannel;
  pendingCount: number;
  oldestAt: string;
}

export interface OverdueBucket {
  label: string;
  count: number;
  amount: number;
}

/* ------------------------------------------------------------------ *
 *  Reservas de canchas (RentalPlaces + ShiftBooking en el schema real)
 * ------------------------------------------------------------------ */

export type RentalPlaceType = 'futbol' | 'padel' | 'tenis' | 'basquet' | 'multiple';

export const rentalPlaceTypeLabels: Record<RentalPlaceType, string> = {
  futbol: 'Fútbol',
  padel: 'Pádel',
  tenis: 'Tenis',
  basquet: 'Básquet',
  multiple: 'Multiuso',
};

export interface RentalPlaceStat {
  /** RentalPlaces.Id */
  id: number;
  /** RentalPlaces.Name */
  name: string;
  /** RentalPlaces.Type (normalizado) */
  type: RentalPlaceType;
  bookings: number;
  amount: number;
  /** Promedio de ocupación (reservas / slots disponibles según RentalPlacesAvailable). */
  occupancyRate: number;
  /** % de reservas para socios (vs. invitados/passersby). */
  partnerShare: number;
}

/* ------------------------------------------------------------------ *
 *  Red Link (cobros recibidos en los últimos N meses)
 * ------------------------------------------------------------------ */

export interface RedLinkMonthlyPoint {
  yearMonth: string;
  amount: number;
  count: number;
}

/**
 * Cross-club Red Link consolidated view.
 *
 * Built by aggregating `RedLinkSummary` of clubs with a real DB connection.
 * Clubs without a connection string (or whose query failed) are listed in
 * `excludedClubs` so the user knows the calculation base.
 */
export interface RedLinkConsolidated {
  monthsBack: number;
  fromYearMonth: string;
  toYearMonth: string;
  /** Club ids included in the totals (only those with successful real query). */
  includedClubs: string[];
  /** Club ids omitted (no connection string, or the query failed) with the reason. */
  excludedClubs: Array<{ id: string; reason: string }>;

  totalAmount: number;
  totalCount: number;
  avgTicket: number;
  uniquePartners: number;
  processedCount: number;
  reconciliationRate: number;
  totalFiles: number;
  automaticFiles: number;
  automaticShare: number;
  deniedCount: number;

  monthly: RedLinkMonthlyPoint[];
}

export interface RedLinkSummary {
  clubId: string;
  /** Inclusive yyyy-mm of the oldest month in the window. */
  fromYearMonth: string;
  /** Inclusive yyyy-mm of the latest month in the window. */
  toYearMonth: string;
  monthsBack: number;

  // Totals over the full window — source: ExtractRedLinkDetail
  totalAmount: number;
  totalCount: number;
  avgTicket: number;
  uniquePartners: number;
  processedCount: number;
  reconciliationRate: number;

  // Imports — source: ExtractRedLink
  totalFiles: number;
  automaticFiles: number;
  automaticShare: number;

  // Rechazos — source: RefreshRedLinkDetail
  deniedCount: number;

  // Breakdowns
  monthly: RedLinkMonthlyPoint[];
  /** 0=Domingo … 6=Sábado */
  weekdayDistribution: number[];
  /** 0..23 */
  hourlyDistribution: number[];
}

export interface BookingStat {
  clubId: string;
  yearMonth: string;
  total: number;
  amount: number;
  avgTicket: number;
  partnerBookings: number;
  guestBookings: number;
  cancelledRate: number;
  occupancyRate: number;
  byPlace: RentalPlaceStat[];
  /** Distribución por día de la semana (0=domingo .. 6=sábado). */
  weekdayDistribution: number[];
  /** Distribución por hora del día (0..23). */
  hourlyDistribution: number[];
}
