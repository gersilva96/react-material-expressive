// Internal date helpers for the date pickers. Native Date only (no deps),
// matching the library's zero-runtime-dependency policy. Not exported from
// the public barrel.

export const DAYS_IN_WEEK = 7;
export const CALENDAR_ROWS = 6;

/** Midnight of the given date (drops the time component). */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return (
    a != null &&
    b != null &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** A new date `n` months from `d` (clamped to the target month's length). */
export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * The current month laid out as 6 weeks × 7 days. Cells before the 1st and
 * after the last day of the month are `null` (M3 shows only the active
 * month's days). `weekStartsOn`: 0 = Sunday … 6 = Saturday.
 */
export function buildMonthMatrix(
  year: number,
  month: number,
  weekStartsOn: number,
): (Date | null)[] {
  const total = daysInMonth(year, month);
  const firstWeekday = new Date(year, month, 1).getDay();
  const lead = (firstWeekday - weekStartsOn + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < DAYS_IN_WEEK * CALENDAR_ROWS; i++) {
    const day = i - lead + 1;
    cells.push(day >= 1 && day <= total ? new Date(year, month, day) : null);
  }
  return cells;
}

export function clampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  if (min && d < startOfDay(min)) return startOfDay(min);
  if (max && d > startOfDay(max)) return startOfDay(max);
  return d;
}

export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isWithin(
  d: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) return false;
  const t = startOfDay(d).getTime();
  return t > startOfDay(start).getTime() && t < startOfDay(end).getTime();
}

/** Narrow weekday labels (e.g. S M T W T F S) rotated to `weekStartsOn`. */
export function weekdayLabels(weekStartsOn: number, locale?: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, {weekday: "narrow"});
  // 2023-01-01 is a Sunday — a stable anchor for weekday 0..6.
  return Array.from({length: DAYS_IN_WEEK}, (_, i) =>
    fmt.format(new Date(2023, 0, 1 + ((weekStartsOn + i) % DAYS_IN_WEEK))),
  );
}

export function formatMonthYear(d: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Header headline, e.g. "Sat, Aug 17". */
export function formatHeadline(d: Date | null, locale?: string): string {
  if (!d) return "";
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Compact date for the input/text field, e.g. "08/17/2024". */
export function formatShort(d: Date | null, locale?: string): string {
  if (!d) return "";
  return new Intl.DateTimeFormat(locale).format(d);
}

/** Full localized date for a day cell's accessible name. */
export function formatDayLabel(d: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }).format(d);
}
