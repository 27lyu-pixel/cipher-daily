import { describe, expect, it } from 'vitest';
import { addDays, dailySeed, isDateString, nyDateString, weekday } from './nyDate';

const at = (iso: string) => nyDateString(new Date(iso));

describe('nyDateString', () => {
  it('rolls over at midnight New York time, not UTC', () => {
    // EDT (UTC-4)
    expect(at('2026-10-12T03:59:59Z')).toBe('2026-10-11');
    expect(at('2026-10-12T04:00:00Z')).toBe('2026-10-12');
    // EST (UTC-5)
    expect(at('2026-12-01T04:59:59Z')).toBe('2026-11-30');
    expect(at('2026-12-01T05:00:00Z')).toBe('2026-12-01');
  });

  it('handles the March DST change (2026-03-08)', () => {
    expect(at('2026-03-08T04:59:59Z')).toBe('2026-03-07');
    expect(at('2026-03-08T05:00:00Z')).toBe('2026-03-08');
    expect(at('2026-03-09T03:59:59Z')).toBe('2026-03-08');
    expect(at('2026-03-09T04:00:00Z')).toBe('2026-03-09');
  });

  it('handles the November DST change (2026-11-01)', () => {
    expect(at('2026-11-01T03:59:59Z')).toBe('2026-10-31');
    expect(at('2026-11-01T04:00:00Z')).toBe('2026-11-01');
    expect(at('2026-11-02T04:59:59Z')).toBe('2026-11-01');
    expect(at('2026-11-02T05:00:00Z')).toBe('2026-11-02');
  });
});

describe('date helpers', () => {
  it('validates YYYY-MM-DD strings', () => {
    expect(isDateString('2026-10-11')).toBe(true);
    expect(isDateString('2028-02-29')).toBe(true);
    expect(isDateString('2026-02-29')).toBe(false);
    expect(isDateString('2026-1-1')).toBe(false);
    expect(isDateString('2026-13-01')).toBe(false);
  });

  it('computes weekdays', () => {
    expect(weekday('2026-10-11')).toBe(0); // Sunday
    expect(weekday('2026-10-17')).toBe(6); // Saturday
  });

  it('adds days across month, year and leap-day boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('builds a versioned daily seed and rejects bad dates', () => {
    expect(dailySeed('2026-10-11')).toBe('cipher-daily:v1:daily:2026-10-11');
    expect(() => dailySeed('2026-02-30')).toThrow(RangeError);
  });
});
