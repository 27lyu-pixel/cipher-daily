/**
 * Reference letter frequencies, in percent, used by the FREQ tab and by tests
 * that check the quote banks read like real English and Spanish.
 *
 * Source: Wikipedia, "Letter frequency", multi-language table (English and
 * Spanish columns; the Spanish column cites Pratt, Secret and Urgent, 1942).
 * The published Spanish column sums to about 104.5% and lists accented vowels
 * separately; spanishLetterFrequency() folds the accents into their base
 * letters (as Xenocrypts do) and normalizes to 100.
 */

export const ENGLISH_LETTER_FREQUENCY: Readonly<Record<string, number>> = {
  A: 8.167, B: 1.492, C: 2.782, D: 4.253, E: 12.702, F: 2.228, G: 2.015, H: 6.094, I: 6.966,
  J: 0.153, K: 0.772, L: 4.025, M: 2.406, N: 6.749, O: 7.507, P: 1.929, Q: 0.095, R: 5.987,
  S: 6.327, T: 9.056, U: 2.758, V: 0.978, W: 2.36, X: 0.15, Y: 1.974, Z: 0.074,
};

/** Spanish column exactly as published, including accented letters. */
export const SPANISH_LETTER_FREQUENCY_PUBLISHED: Readonly<Record<string, number>> = {
  A: 11.525, B: 2.215, C: 4.019, D: 5.01, E: 13.702, F: 0.692, G: 1.768, H: 1.973, I: 6.247,
  J: 0.493, K: 0.026, L: 4.967, M: 3.157, N: 6.712, Ñ: 0.311, O: 8.683, P: 2.51, Q: 0.877,
  R: 6.871, S: 7.977, T: 4.632, U: 3.927, V: 1.138, W: 0.027, X: 0.515, Y: 1.433, Z: 0.467,
  Á: 0.502, É: 0.433, Í: 0.725, Ó: 0.827, Ú: 0.168, Ü: 0.012,
};

const ACCENT_BASE: Readonly<Record<string, string>> = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U' };

/** Spanish frequencies over the 27-letter Xenocrypt alphabet (accents folded), summing to 100. */
export function spanishLetterFrequency(): Record<string, number> {
  const folded: Record<string, number> = {};
  for (const [letter, pct] of Object.entries(SPANISH_LETTER_FREQUENCY_PUBLISHED)) {
    const base = ACCENT_BASE[letter] ?? letter;
    folded[base] = (folded[base] ?? 0) + pct;
  }
  const total = Object.values(folded).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.entries(folded).map(([k, v]) => [k, (v / total) * 100]));
}
