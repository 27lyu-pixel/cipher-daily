import { describe, expect, it } from 'vitest';
import { activeCiphers, CIPHER_IDS, CIPHERS, isActive, isLegacy, type Division } from './ciphers';
import { REFERENCE_SHEET } from './referenceSheet';
import { questionScore, timedBonus } from './rules';
import { SCHEDULE } from './schedule';

describe('cipher catalog', () => {
  it('lists all 17 types, each keyed by its own id', () => {
    expect(CIPHER_IDS).toHaveLength(17);
    for (const id of CIPHER_IDS) expect(CIPHERS[id].id).toBe(id);
  });

  it('matches the 2026-27 Division C table', () => {
    const active = ['aristocrat', 'patristocrat', 'xenocrypt', 'homophonic', 'porta', 'nihilist', 'baconian',
      'fracmorse', 'columnar', 'checkerboard', 'cryptarithm'];
    expect(activeCiphers('C', 'regional').sort()).toEqual([...active].sort());
    expect(activeCiphers('C', 'state').sort()).toEqual([...active].sort());
    for (const id of ['caesar', 'atbash', 'affine', 'hill', 'pollux', 'morbit'] as const) {
      expect(isLegacy(id, 'C')).toBe(true);
    }
  });

  it('keeps Caesar and Atbash as Division B only', () => {
    expect(isActive('caesar', 'B', 'regional')).toBe(true);
    expect(isActive('atbash', 'B', 'state')).toBe(true);
    expect(isLegacy('hill', 'B')).toBe(true);
  });
});

describe('daily schedule', () => {
  for (const [division, week] of Object.entries(SCHEDULE) as [Division, NonNullable<(typeof SCHEDULE)[Division]>][]) {
    const activeAnyLevel = CIPHER_IDS.filter((id) => !isLegacy(id, division));

    it(`Division ${division}: every active type appears at least once a week`, () => {
      const scheduled = new Set(week.flatMap((d) => [d.featured, ...d.others]));
      for (const id of activeAnyLevel) expect(scheduled, id).toContain(id);
    });

    it(`Division ${division}: schedules only active types, with no repeats in a day`, () => {
      for (const day of week) {
        const all = [day.featured, ...day.others];
        expect(new Set(all).size).toBe(all.length);
        for (const id of all) expect(activeAnyLevel).toContain(id);
      }
    });
  }
});

describe('scoring rules', () => {
  it('computes the timed bonus as 2 x (600 - seconds)', () => {
    expect(timedBonus(435)).toBe(330);
    expect(timedBonus(0)).toBe(1200);
    expect(timedBonus(599.9)).toBe(2);
    expect(timedBonus(600)).toBe(0);
    expect(timedBonus(900)).toBe(0);
  });

  it('allows two free errors, then deducts per extra error, never below zero', () => {
    expect(questionScore(300, 0)).toBe(300);
    expect(questionScore(300, 2)).toBe(300);
    expect(questionScore(300, 3)).toBe(200);
    expect(questionScore(300, 10)).toBe(0);
  });
});

describe('reference sheet', () => {
  it('stays marked UNVERIFIED until the official sheet is added', () => {
    if (REFERENCE_SHEET.status === 'UNVERIFIED') {
      expect(REFERENCE_SHEET.source).toBeNull();
      for (const s of REFERENCE_SHEET.sections) expect(s.title).toContain('UNVERIFIED');
    } else {
      expect(REFERENCE_SHEET.source).toBeTruthy();
    }
  });
});
