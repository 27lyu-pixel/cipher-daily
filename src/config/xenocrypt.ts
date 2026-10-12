import type { AristocratAlphabet, Division } from './ciphers';
import type { RuleStatus } from './rules';

/**
 * How Xenocrypts (Spanish monoalphabetic ciphers) treat Spanish letters.
 *
 * Sources:
 *  - Toebes, "Test Guidance" (https://toebes.com/codebusters/TestGuidance.html):
 *    Ñ is listed as its own letter; if a ciphertext would contain both N and Ñ,
 *    re-encode to avoid confusing teams; avoid phrases that depend on accents;
 *    use K1 or K2 alphabets with an English keyword (Division B: K1 only).
 *  - NC Science Olympiad 2018 Codebusters Coaches Institute Notes: accent marks
 *    are removed before encoding, and answers do not need accents.
 * Neither is the official rules text, so everything here is 'unofficial'.
 */

export interface XenocryptRules {
  status: RuleStatus;
  sources: string[];
  /** Plaintext alphabet, in order. Ñ follows N. */
  alphabet: string;
  /** Ñ is its own letter, not folded into N. */
  enyeIsSeparateLetter: boolean;
  /** Accented vowels are encoded as their unaccented base letter. */
  accentFolding: Readonly<Record<string, string>>;
  /** Answers are graded without accents. */
  accentsRequiredInAnswer: boolean;
  /** Reject a generated key if the ciphertext would contain both N and Ñ. */
  avoidBothNAndEnyeInCiphertext: boolean;
  alphabets: Record<Division, AristocratAlphabet[]>;
  keywordLanguage: 'en';
}

export const XENOCRYPT: XenocryptRules = {
  status: 'unofficial',
  sources: [
    'https://toebes.com/codebusters/TestGuidance.html',
    'https://ncscienceolympiad.ncsu.edu/wp-content/uploads/2018/11/2018-Codebusters-Coaches-Institute-Notes.pdf',
  ],
  alphabet: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
  enyeIsSeparateLetter: true,
  accentFolding: { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U' },
  accentsRequiredInAnswer: false,
  avoidBothNAndEnyeInCiphertext: true,
  alphabets: { B: ['K1'], C: ['K1', 'K2'] },
  keywordLanguage: 'en',
};

/** Uppercase Spanish text and fold accented vowels, keeping Ñ. Non-letters pass through. */
export function foldSpanish(text: string, rules: XenocryptRules = XENOCRYPT): string {
  return [...text.toUpperCase()].map((c) => rules.accentFolding[c] ?? c).join('');
}
