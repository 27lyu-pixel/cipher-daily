import { describe, expect, it } from 'vitest';
import { fnv1a } from '../lib/hash';
import { createRng } from '../lib/rng';
import enRaw from './quotes.en.json';
import esRaw from './quotes.es.json';
import lock from './quotes.lock.json';
import { findQuotes, getQuotes, letterCount, lengthBucket, pickQuote, quoteById } from './quoteBank';

describe('quote banks', () => {
  it('has at least 500 English quotes', () => {
    expect(getQuotes('en').length).toBeGreaterThanOrEqual(500);
  });

  it('has Spanish quotes for Xenocrypts', () => {
    expect(getQuotes('es').length).toBeGreaterThanOrEqual(90);
  });

  it('has no duplicate texts', () => {
    for (const lang of ['en', 'es'] as const) {
      const texts = getQuotes(lang).map((q) => q.text.toLowerCase());
      expect(new Set(texts).size).toBe(texts.length);
    }
  });

  it('uses only expected characters', () => {
    for (const q of getQuotes('en')) expect(q.text).toMatch(/^[A-Za-z0-9 .,;:'!?()-]+$/);
    for (const q of getQuotes('es')) expect(q.text).toMatch(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,;:'¡!¿?()-]+$/);
  });

  it('every quote has an author', () => {
    for (const q of [...getQuotes('en'), ...getQuotes('es')]) expect(q.author.trim()).not.toBe('');
  });

  // Append-only guard: existing entries must never change, or past daily sets change with them.
  it('existing entries match quotes.lock.json', () => {
    const banks = { en: enRaw, es: esRaw };
    for (const lang of ['en', 'es'] as const) {
      const { count, fnv1a: expected } = lock[lang];
      expect(banks[lang].length).toBeGreaterThanOrEqual(count);
      expect(fnv1a(JSON.stringify(banks[lang].slice(0, count)))).toBe(expected);
    }
  });
});

describe('quote helpers', () => {
  it('counts letters, including accented letters and Ñ', () => {
    expect(letterCount('Ver para creer.')).toBe(12);
    expect(letterCount('Las apariencias engañan.')).toBe(21);
    expect(letterCount("Don't panic!")).toBe(9);
  });

  it('buckets by letter count', () => {
    expect(lengthBucket(39)).toBe('short');
    expect(lengthBucket(40)).toBe('medium');
    expect(lengthBucket(80)).toBe('long');
    expect(lengthBucket(120)).toBe('xl');
  });

  it('looks quotes up by id', () => {
    const first = getQuotes('es')[0]!;
    expect(quoteById(first.id)).toBe(first);
    expect(quoteById('en-999999')).toBeUndefined();
    expect(quoteById('fr-1')).toBeUndefined();
  });

  it('filters by length and picks deterministically', () => {
    const query = { lang: 'en' as const, minLetters: 50, maxLetters: 90 };
    for (const q of findQuotes(query)) {
      expect(q.letters).toBeGreaterThanOrEqual(50);
      expect(q.letters).toBeLessThanOrEqual(90);
    }
    expect(pickQuote(createRng('p'), query)).toBe(pickQuote(createRng('p'), query));
    expect(() => pickQuote(createRng('p'), { lang: 'en', minLetters: 10_000 })).toThrow();
  });
});
