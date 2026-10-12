import { fnv1a } from './hash';

/** mulberry32: small, fast 32-bit PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Rng {
  /** The string this generator was seeded from. */
  readonly seed: string;
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [0, maxExclusive). */
  int(maxExclusive: number): number;
  /** Integer in [min, max], inclusive. */
  range(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  /** Returns a shuffled copy (Fisher-Yates). */
  shuffle<T>(items: readonly T[]): T[];
  /**
   * Independent child generator keyed by `label`. Use one per question slot so
   * that adding or reordering slots never shifts the random stream of the others.
   */
  derive(label: string): Rng;
}

export function createRng(seed: string): Rng {
  const next = mulberry32(fnv1a(seed));
  const int = (maxExclusive: number): number => {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
      throw new RangeError(`int() needs a positive integer, got ${maxExclusive}`);
    }
    return Math.floor(next() * maxExclusive);
  };
  return {
    seed,
    next,
    int,
    range: (min, max) => {
      if (max < min) throw new RangeError(`range(${min}, ${max}) is empty`);
      return min + int(max - min + 1);
    },
    pick: (items) => {
      if (items.length === 0) throw new RangeError('pick() from an empty list');
      return items[int(items.length)]!;
    },
    shuffle: (items) => {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(i + 1);
        [out[i], out[j]] = [out[j]!, out[i]!];
      }
      return out;
    },
    derive: (label) => createRng(`${seed}/${label}`),
  };
}
