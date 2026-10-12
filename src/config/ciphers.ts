/**
 * Cipher catalog with per-season, per-division availability.
 *
 * 2026-27 availability is transcribed from Toebes's rules summary
 * (https://toebes.com/codebusters/Rule-Summary-2027.html), which cites rule
 * numbers in the official Codebusters rules. Verify against the official rules
 * before relying on it for anything other than practice.
 *
 * A type with no entry for the current season and division is "legacy": it is
 * still playable in practice when legacy types are turned on, but mock tests,
 * the daily rotation, and "train weakness" never pick it.
 */

export const CIPHER_IDS = [
  'aristocrat',
  'patristocrat',
  'xenocrypt',
  'homophonic',
  'caesar',
  'atbash',
  'affine',
  'hill',
  'porta',
  'nihilist',
  'baconian',
  'fracmorse',
  'pollux',
  'morbit',
  'columnar',
  'checkerboard',
  'cryptarithm',
] as const;

export type CipherId = (typeof CIPHER_IDS)[number];
export type Division = 'B' | 'C';
export type Level = 'regional' | 'state';
export type Season = '2026-27';
/** What a question may ask: decode with the key given, or recover it (cryptanalysis). */
export type QuestionMode = 'decode' | 'cryptanalysis';
export type AristocratAlphabet = 'random' | 'K1' | 'K2' | 'K3';

export interface LevelRules {
  modes: QuestionMode[];
  /** Aristocrat only: which alphabet constructions may appear. */
  alphabets?: AristocratAlphabet[];
  /** Aristocrat only: whether a question may ask for the keyword itself. */
  keywordQuestion?: boolean;
  /** Xenocrypt only: number of xenocrypts on a test, [min, max]. */
  count?: [number, number];
  /** Baconian only: largest number of distinct symbols. */
  maxSymbols?: number;
  /** Rule reference in the official rules, e.g. "3.e.iv". */
  rule?: string;
}

export type DivisionRules = Record<Level, LevelRules>;

export interface CipherInfo {
  id: CipherId;
  name: string;
  family: 'monoalphabetic' | 'polyalphabetic' | 'polybius' | 'morse' | 'transposition' | 'math' | 'steganography';
  seasons: Partial<Record<Season, Partial<Record<Division, DivisionRules>>>>;
}

export const CURRENT_SEASON: Season = '2026-27';

const both = (rules: LevelRules): DivisionRules => ({ regional: rules, state: rules });

export const CIPHERS: Record<CipherId, CipherInfo> = {
  aristocrat: {
    id: 'aristocrat',
    name: 'Aristocrat',
    family: 'monoalphabetic',
    seasons: {
      '2026-27': {
        B: both({ modes: ['decode', 'cryptanalysis'], alphabets: ['random'], rule: '3.e.i(1)' }),
        C: both({
          modes: ['decode', 'cryptanalysis'],
          alphabets: ['random', 'K1', 'K2', 'K3'],
          keywordQuestion: true,
          rule: '3.e.i(1), 3.e.ii',
        }),
      },
    },
  },
  patristocrat: {
    id: 'patristocrat',
    name: 'Patristocrat',
    family: 'monoalphabetic',
    seasons: {
      '2026-27': {
        B: both({ modes: ['decode', 'cryptanalysis'], rule: '3.e.i(2)' }),
        C: both({ modes: ['decode', 'cryptanalysis'], rule: '3.e.i(2)' }),
      },
    },
  },
  xenocrypt: {
    id: 'xenocrypt',
    name: 'Xenocrypt (Spanish)',
    family: 'monoalphabetic',
    seasons: {
      '2026-27': {
        B: {
          regional: { modes: ['decode', 'cryptanalysis'], count: [0, 1], rule: '3.e.iii' },
          state: { modes: ['decode', 'cryptanalysis'], count: [1, 2], rule: '3.f.ii' },
        },
        C: {
          regional: { modes: ['decode', 'cryptanalysis'], count: [0, 2], rule: '3.e.iv' },
          state: { modes: ['decode', 'cryptanalysis'], count: [2, 3], rule: '3.f.ii' },
        },
      },
    },
  },
  homophonic: {
    id: 'homophonic',
    name: 'Homophonic',
    family: 'monoalphabetic',
    seasons: {
      '2026-27': {
        B: {
          regional: { modes: ['cryptanalysis'], rule: '3.e.xii' },
          state: { modes: ['cryptanalysis', 'decode'], rule: '3.f.vi' },
        },
        C: {
          regional: { modes: ['cryptanalysis'], rule: '3.e.xi' },
          state: { modes: ['cryptanalysis', 'decode'], rule: '3.f.vii' },
        },
      },
    },
  },
  caesar: {
    id: 'caesar',
    name: 'Caesar',
    family: 'monoalphabetic',
    seasons: { '2026-27': { B: both({ modes: ['decode'], rule: '3.e.x' }) } },
  },
  atbash: {
    id: 'atbash',
    name: 'Atbash',
    family: 'monoalphabetic',
    seasons: { '2026-27': { B: both({ modes: ['decode'], rule: '3.e.ix' }) } },
  },
  affine: { id: 'affine', name: 'Affine', family: 'monoalphabetic', seasons: {} },
  hill: { id: 'hill', name: 'Hill', family: 'math', seasons: {} },
  porta: {
    id: 'porta',
    name: 'Porta',
    family: 'polyalphabetic',
    seasons: {
      '2026-27': {
        B: {
          regional: { modes: ['decode'], rule: '3.e.vi' },
          state: { modes: ['cryptanalysis'], rule: '3.f.iii' },
        },
        C: {
          regional: { modes: ['decode'], rule: '3.e.vii' },
          state: { modes: ['decode', 'cryptanalysis'], rule: '3.f.iii' },
        },
      },
    },
  },
  nihilist: {
    id: 'nihilist',
    name: 'Nihilist Substitution',
    family: 'polybius',
    seasons: {
      '2026-27': {
        B: {
          regional: { modes: ['decode'], rule: '3.e.viii' },
          state: { modes: ['cryptanalysis'], rule: '3.f.iv' },
        },
        C: {
          regional: { modes: ['decode'], rule: '3.e.ix' },
          state: { modes: ['decode', 'cryptanalysis'], rule: '3.f.iv' },
        },
      },
    },
  },
  baconian: {
    id: 'baconian',
    name: 'Baconian',
    family: 'steganography',
    seasons: {
      '2026-27': {
        B: both({ modes: ['cryptanalysis'], rule: '3.e.ii' }),
        C: both({ modes: ['cryptanalysis'], rule: '3.e.iii' }),
      },
    },
  },
  fracmorse: {
    id: 'fracmorse',
    name: 'Fractionated Morse',
    family: 'morse',
    seasons: {
      '2026-27': {
        B: both({ modes: ['decode', 'cryptanalysis'], rule: '3.e.iv' }),
        C: both({ modes: ['decode', 'cryptanalysis'], rule: '3.e.v' }),
      },
    },
  },
  pollux: { id: 'pollux', name: 'Pollux', family: 'morse', seasons: {} },
  morbit: { id: 'morbit', name: 'Morbit', family: 'morse', seasons: {} },
  columnar: {
    id: 'columnar',
    name: 'Complete Columnar',
    family: 'transposition',
    seasons: {
      '2026-27': {
        B: both({ modes: ['cryptanalysis'], rule: '3.e.vii' }),
        C: {
          regional: { modes: ['cryptanalysis'], rule: '3.e.viii' },
          state: { modes: ['cryptanalysis'], rule: '3.f.v' },
        },
      },
    },
  },
  checkerboard: {
    id: 'checkerboard',
    name: 'Checkerboard',
    family: 'polybius',
    seasons: {
      '2026-27': {
        B: {
          regional: { modes: ['decode'], rule: '3.e.xi' },
          state: { modes: ['decode', 'cryptanalysis'], rule: '3.f.v' },
        },
        C: {
          regional: { modes: ['decode', 'cryptanalysis'], rule: '3.e.x' },
          state: { modes: ['decode', 'cryptanalysis'], rule: '3.f.vi' },
        },
      },
    },
  },
  cryptarithm: {
    id: 'cryptarithm',
    name: 'Cryptarithm',
    family: 'math',
    seasons: {
      '2026-27': {
        B: both({ modes: ['decode', 'cryptanalysis'], rule: '3.e.v' }),
        C: both({ modes: ['decode', 'cryptanalysis'], rule: '3.e.vi' }),
      },
    },
  },
};

export function levelRules(
  id: CipherId,
  division: Division,
  level: Level,
  season: Season = CURRENT_SEASON,
): LevelRules | undefined {
  return CIPHERS[id].seasons[season]?.[division]?.[level];
}

/** Active = allowed at this division and level in the given season. */
export function isActive(id: CipherId, division: Division, level: Level, season: Season = CURRENT_SEASON): boolean {
  return levelRules(id, division, level, season) !== undefined;
}

/** Legacy = not allowed at any level of this division in the given season. */
export function isLegacy(id: CipherId, division: Division, season: Season = CURRENT_SEASON): boolean {
  return !isActive(id, division, 'regional', season) && !isActive(id, division, 'state', season);
}

export function activeCiphers(division: Division, level: Level, season: Season = CURRENT_SEASON): CipherId[] {
  return CIPHER_IDS.filter((id) => isActive(id, division, level, season));
}
