import { describe, expect, it } from 'vitest';
import { fnv1a } from './hash';
import { createRng, mulberry32 } from './rng';

describe('fnv1a', () => {
  it('matches the published FNV-1a 32-bit test vectors', () => {
    expect(fnv1a('')).toBe(0x811c9dc5);
    expect(fnv1a('a')).toBe(0xe40c292c);
    expect(fnv1a('foobar')).toBe(0xbf9cf968);
  });
});

describe('mulberry32', () => {
  it('matches the reference implementation', () => {
    const r = mulberry32(1);
    expect(r()).toBe(0.6270739405881613);
    expect(r()).toBe(0.002735721180215478);
    expect(r()).toBe(0.5274470399599522);
  });
});

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng('seed');
    const b = createRng('seed');
    expect(Array.from({ length: 20 }, () => a.next())).toEqual(Array.from({ length: 20 }, () => b.next()));
  });

  it('differs for different seeds', () => {
    expect(createRng('2026-10-11').next()).not.toBe(createRng('2026-10-12').next());
  });

  it('derive() is independent of how much the parent has been used', () => {
    const fresh = createRng('s').derive('slot1');
    const used = createRng('s');
    for (let i = 0; i < 50; i++) used.next();
    expect(used.derive('slot1').next()).toBe(fresh.next());
  });

  it('int() and range() stay in bounds and hit both ends', () => {
    const r = createRng('bounds');
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      const n = r.range(3, 7);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(7);
      seen.add(n);
    }
    expect([...seen].sort()).toEqual([3, 4, 5, 6, 7]);
  });

  it('rejects empty ranges and lists', () => {
    const r = createRng('x');
    expect(() => r.int(0)).toThrow(RangeError);
    expect(() => r.range(5, 4)).toThrow(RangeError);
    expect(() => r.pick([])).toThrow(RangeError);
  });

  it('shuffle() returns a deterministic permutation without mutating the input', () => {
    const input = Array.from({ length: 26 }, (_, i) => i);
    const a = createRng('shuffle').shuffle(input);
    expect(createRng('shuffle').shuffle(input)).toEqual(a);
    expect([...a].sort((x, y) => x - y)).toEqual(input);
    expect(input).toEqual(Array.from({ length: 26 }, (_, i) => i));
  });
});
