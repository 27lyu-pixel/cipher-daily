import { describe, expect, it } from 'vitest';
import { getQuotes } from '../data/quoteBank';
import { ENGLISH_LETTER_FREQUENCY, spanishLetterFrequency } from './frequency';
import { foldSpanish, XENOCRYPT } from './xenocrypt';

/** Letter distribution (fractions summing to 1) over the given alphabet. */
function distribution(texts: string[], alphabet: string): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries([...alphabet].map((c) => [c, 0]));
  let total = 0;
  for (const t of texts) {
    for (const c of foldSpanish(t)) {
      if (c in counts) {
        counts[c]! += 1;
        total += 1;
      }
    }
  }
  return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v / total]));
}

function normalize(pct: Record<string, number>, alphabet: string): Record<string, number> {
  const total = [...alphabet].reduce((s, c) => s + (pct[c] ?? 0), 0);
  return Object.fromEntries([...alphabet].map((c) => [c, (pct[c] ?? 0) / total]));
}

/** Total variation distance: half the sum of absolute differences (0 = identical, 1 = disjoint). */
const tvd = (a: Record<string, number>, b: Record<string, number>) =>
  Object.keys(a).reduce((s, k) => s + Math.abs(a[k]! - b[k]!), 0) / 2;

function correlation(a: Record<string, number>, b: Record<string, number>): number {
  const keys = Object.keys(a);
  const mean = (r: Record<string, number>) => keys.reduce((s, k) => s + r[k]!, 0) / keys.length;
  const [ma, mb] = [mean(a), mean(b)];
  let num = 0;
  let da = 0;
  let db = 0;
  for (const k of keys) {
    num += (a[k]! - ma) * (b[k]! - mb);
    da += (a[k]! - ma) ** 2;
    db += (b[k]! - mb) ** 2;
  }
  return num / Math.sqrt(da * db);
}

describe('Xenocrypt letter handling', () => {
  it('uses a 27-letter alphabet with Ñ after N', () => {
    expect([...XENOCRYPT.alphabet]).toHaveLength(27);
    expect(XENOCRYPT.alphabet.indexOf('Ñ')).toBe(XENOCRYPT.alphabet.indexOf('N') + 1);
  });

  it('folds accents but keeps Ñ', () => {
    expect(foldSpanish('Canción de otoño, pingüino, árbol')).toBe('CANCION DE OTOÑO, PINGUINO, ARBOL');
  });
});

describe('Spanish quote bank', () => {
  const quotes = getQuotes('es');
  const alphabet = XENOCRYPT.alphabet;
  const reference = normalize(spanishLetterFrequency(), alphabet);
  const bank = distribution(quotes.map((q) => q.text), alphabet);

  it('has at least 100 original sentences of 60-120 letters', () => {
    const originals = quotes.filter((q) => q.author === 'Original');
    expect(originals.length).toBeGreaterThanOrEqual(100);
    for (const q of originals) {
      expect(q.letters, q.text).toBeGreaterThanOrEqual(60);
      expect(q.letters, q.text).toBeLessThanOrEqual(120);
    }
  });

  it('only uses letters from the Xenocrypt alphabet once accents are folded', () => {
    for (const q of quotes) {
      for (const c of foldSpanish(q.text)) if (/\p{L}/u.test(c)) expect(alphabet, q.text).toContain(c);
    }
  });

  // English and Spanish reference frequencies are 0.150 apart; 0.08 flags text drifting toward non-Spanish.
  it('has letter frequencies close to standard Spanish', () => {
    expect(tvd(bank, reference)).toBeLessThan(0.08);
    expect(correlation(bank, reference)).toBeGreaterThan(0.97);
    const top3 = Object.entries(bank).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k]) => k);
    expect([...top3].sort()).toEqual(['A', 'E', 'O']);
  });

  it('is clearly closer to Spanish than to English', () => {
    const english = normalize(ENGLISH_LETTER_FREQUENCY, alphabet);
    expect(tvd(bank, reference)).toBeLessThan(tvd(bank, english) / 2);
  });
});
