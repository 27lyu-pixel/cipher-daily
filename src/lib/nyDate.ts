/** Daily puzzles roll over at midnight America/New_York for every player. */
export const PUZZLE_TIME_ZONE = 'America/New_York';

/** Bump to deliberately regenerate every daily set (breaks archive replays). */
export const SEED_VERSION = 'v1';

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: PUZZLE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Calendar date in New York for the given instant, as YYYY-MM-DD. */
export function nyDateString(at: Date = new Date()): string {
  const parts = Object.fromEntries(formatter.formatToParts(at).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateString(s: string): boolean {
  const m = DATE_RE.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

function assertDate(s: string): void {
  if (!isDateString(s)) throw new RangeError(`Not a valid YYYY-MM-DD date: ${s}`);
}

/** 0 = Sunday ... 6 = Saturday, for a YYYY-MM-DD calendar date. */
export function weekday(date: string): number {
  assertDate(date);
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Shift a YYYY-MM-DD date by whole days. */
export function addDays(date: string, days: number): string {
  assertDate(date);
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Seed string for a given daily set. Everyone on the same NY date gets the same seed. */
export function dailySeed(date: string): string {
  assertDate(date);
  return `cipher-daily:${SEED_VERSION}:daily:${date}`;
}
