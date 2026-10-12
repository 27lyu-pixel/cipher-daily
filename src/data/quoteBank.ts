import type { Rng } from '../lib/rng';
import enRaw from './quotes.en.json';
import esRaw from './quotes.es.json';

/**
 * Quote banks are append-only: a quote's id is its position in the file, and
 * daily sets reference quotes by id. Editing or reordering existing entries
 * changes past daily sets; quotes.lock.json and quoteBank.test.ts guard this.
 */

export type Lang = 'en' | 'es';
export type LengthBucket = 'short' | 'medium' | 'long' | 'xl';

export interface Quote {
  id: string;
  lang: Lang;
  text: string;
  author: string;
  /** Number of letters (accented letters and Ñ count; spaces and punctuation don't). */
  letters: number;
  bucket: LengthBucket;
}

export function letterCount(text: string): number {
  return text.match(/\p{L}/gu)?.length ?? 0;
}

export function lengthBucket(letters: number): LengthBucket {
  if (letters < 40) return 'short';
  if (letters < 80) return 'medium';
  if (letters < 120) return 'long';
  return 'xl';
}

function load(lang: Lang, raw: unknown): Quote[] {
  if (!Array.isArray(raw)) throw new Error(`quotes.${lang}.json must be an array`);
  return raw.map((entry, index) => {
    if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || typeof entry[1] !== 'string') {
      throw new Error(`quotes.${lang}.json entry ${index} must be [text, author]`);
    }
    const [text, author] = entry as [string, string];
    const letters = letterCount(text);
    return { id: `${lang}-${index}`, lang, text, author, letters, bucket: lengthBucket(letters) };
  });
}

const BANKS: Record<Lang, readonly Quote[]> = {
  en: load('en', enRaw),
  es: load('es', esRaw),
};

export function getQuotes(lang: Lang): readonly Quote[] {
  return BANKS[lang];
}

export function quoteById(id: string): Quote | undefined {
  const m = /^(en|es)-(\d+)$/.exec(id);
  if (!m) return undefined;
  return BANKS[m[1] as Lang][Number(m[2])];
}

export interface QuoteQuery {
  lang: Lang;
  minLetters?: number;
  maxLetters?: number;
}

export function findQuotes({ lang, minLetters = 0, maxLetters = Infinity }: QuoteQuery): Quote[] {
  return BANKS[lang].filter((q) => q.letters >= minLetters && q.letters <= maxLetters);
}

export function pickQuote(rng: Rng, query: QuoteQuery): Quote {
  const matches = findQuotes(query);
  if (matches.length === 0) {
    throw new Error(`No ${query.lang} quotes with ${query.minLetters ?? 0}-${query.maxLetters ?? 'any'} letters`);
  }
  return rng.pick(matches);
}
