/**
 * Period axis for the dashboard.
 *
 * Months are plain calendar labels (`yyyy-mm`); whether a month actually has
 * data is decided by the queries, never here.
 */

export function lastNMonths(n: number, refDate = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

/** Rolling 12-month window ending in the current month. */
export const months = lastNMonths(12);

export const latestMonth = months[months.length - 1];
export const previousMonth = months[months.length - 2];

/** True when the given `yyyy-mm` is the month currently in progress. */
export function isCurrentMonth(yearMonth: string, refDate = new Date()): boolean {
  const current = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, '0')}`;
  return yearMonth === current;
}
