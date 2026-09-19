/**
 * Argentine Spanish formatters.
 */

const currencyFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const compactCurrencyFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 1,
  notation: 'compact',
});

const numberFmt = new Intl.NumberFormat('es-AR');

const percentFmt = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 1,
});

const compactNumberFmt = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

export function formatCurrency(value: number): string {
  return currencyFmt.format(value);
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFmt.format(value);
}

export function formatNumber(value: number): string {
  return numberFmt.format(value);
}

export function formatCompactNumber(value: number): string {
  return compactNumberFmt.format(value);
}

export function formatPercent(value: number): string {
  return percentFmt.format(value);
}

/**
 * Format a YYYY-MM string into a short Spanish month label.
 */
export function formatYearMonth(yearMonth: string, opts: { withYear?: boolean } = {}): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  const month = d.toLocaleString('es-AR', { month: 'short' }).replace('.', '');
  return opts.withYear ? `${month} ${String(y).slice(-2)}` : month;
}

/**
 * Convert a positive/negative delta into a signed percent string.
 */
export function formatDeltaPercent(currentValue: number, previousValue: number): string {
  if (previousValue === 0) return '—';
  const delta = (currentValue - previousValue) / previousValue;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${percentFmt.format(delta)}`;
}

export function deltaDirection(currentValue: number, previousValue: number): 'up' | 'down' | 'flat' {
  if (previousValue === 0) return 'flat';
  const delta = (currentValue - previousValue) / previousValue;
  if (Math.abs(delta) < 0.005) return 'flat';
  return delta > 0 ? 'up' : 'down';
}
