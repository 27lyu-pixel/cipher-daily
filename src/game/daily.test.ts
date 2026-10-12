import { describe, expect, it } from 'vitest';
import { SCHEDULE } from '../config/schedule';
import { quoteById } from '../data/quoteBank';
import { addDays, weekday } from '../lib/nyDate';
import { generateDailySet } from './daily';

describe('generateDailySet', () => {
  it('returns the same set for the same date', () => {
    expect(generateDailySet('2026-10-11')).toEqual(generateDailySet('2026-10-11'));
  });

  it('follows the weekday schedule and gives every day a distinct seed', () => {
    const seeds = new Set<string>();
    for (let i = 0; i < 14; i++) {
      const date = addDays('2026-10-11', i);
      const set = generateDailySet(date);
      const day = SCHEDULE.C![weekday(date)]!;
      expect(set.slots.map((s) => s.cipher)).toEqual([day.featured, ...day.others]);
      seeds.add(set.seed);
    }
    expect(seeds.size).toBe(14);
  });

  it('uses Spanish quotes for Xenocrypts and no quote for Cryptarithms', () => {
    for (let i = 0; i < 7; i++) {
      for (const slot of generateDailySet(addDays('2026-10-11', i)).slots) {
        if (slot.cipher === 'cryptarithm') expect(slot.quoteId).toBeNull();
        else expect(quoteById(slot.quoteId!)!.lang).toBe(slot.cipher === 'xenocrypt' ? 'es' : 'en');
      }
    }
  });

  it('varies quotes from day to day', () => {
    const featured = Array.from({ length: 30 }, (_, i) => generateDailySet(addDays('2026-10-11', i)).slots[0]!.quoteId);
    expect(new Set(featured).size).toBeGreaterThan(20);
  });

  it('rejects divisions without a schedule', () => {
    expect(() => generateDailySet('2026-10-11', 'B')).toThrow();
  });
});
