import { CIPHER_IDS, type CipherId } from '../config/ciphers';
import type { KeyValueStorage } from './storage';

/**
 * The attempt log is the single record of play. Stats, adaptive practice,
 * error analysis, team mode and the coach view all read from it.
 *
 * Raw attempts are capped per cipher; when a cipher exceeds the cap, its oldest
 * attempts are folded into a per-cipher aggregate so long-run totals survive.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Mode = 'daily' | 'practice' | 'mock' | 'paper' | 'drill' | 'team';
export type HintKind = 'letter' | 'crib' | 'keyword-length';
export type MistakeKind = 'wrong-mapping' | 'arithmetic-slip' | 'misread-crib' | 'out-of-time';

export interface WrongLetter {
  /** Position in the plaintext answer. */
  index: number;
  expected: string;
  /** What the player entered; '' for a blank. */
  got: string;
}

export interface Attempt {
  v: 1;
  id: string;
  cipher: CipherId;
  /** Sub-type, e.g. 'K2' for an Aristocrat or '3x3' for Hill. */
  variant?: string;
  difficulty: Difficulty;
  mode: Mode;
  seed: string;
  testId?: string;
  questionIndex?: number;
  player?: string;
  startedAt: number;
  durationMs: number;
  solved: boolean;
  errors: number;
  blanks: number;
  wrong: WrongLetter[];
  hints: HintKind[];
  pointsPossible: number;
  pointsEarned: number;
  strict: boolean;
  mistakes: MistakeKind[];
  /** True once the player has relabeled the automatic mistake classification. */
  mistakesEditedByUser?: boolean;
}

export interface Aggregate {
  attempts: number;
  solved: number;
  totalMs: number;
  errors: number;
  hintsUsed: number;
}

/** One finished run through a cipher's tutorial. Tutorials are never capped or rolled up. */
export interface TutorialCompletion {
  v: 1;
  id: string;
  cipher: CipherId;
  completedAt: number;
  durationMs: number;
  /** Whether the guided practice puzzle at the end was solved. */
  guidedPuzzleSolved: boolean;
  /** Step-by-step hints unlocked on the guided puzzle. */
  hintsUsed: number;
}

interface Persisted {
  v: 1;
  attempts: Attempt[];
  aggregates: Partial<Record<CipherId, Aggregate>>;
  tutorials: TutorialCompletion[];
}

export const ATTEMPTS_KEY = 'cd:v1:attempts';
export const DEFAULT_MAX_PER_CIPHER = 200;

const emptyAggregate = (): Aggregate => ({ attempts: 0, solved: 0, totalMs: 0, errors: 0, hintsUsed: 0 });

function addTo(agg: Aggregate, a: Attempt): Aggregate {
  return {
    attempts: agg.attempts + 1,
    solved: agg.solved + (a.solved ? 1 : 0),
    totalMs: agg.totalMs + a.durationMs,
    errors: agg.errors + a.errors,
    hintsUsed: agg.hintsUsed + a.hints.length,
  };
}

function isAttempt(x: unknown): x is Attempt {
  if (typeof x !== 'object' || x === null) return false;
  const a = x as Record<string, unknown>;
  return (
    a.v === 1 &&
    typeof a.id === 'string' &&
    (CIPHER_IDS as readonly unknown[]).includes(a.cipher) &&
    typeof a.startedAt === 'number' &&
    typeof a.durationMs === 'number' &&
    typeof a.solved === 'boolean' &&
    typeof a.errors === 'number' &&
    Array.isArray(a.wrong) &&
    Array.isArray(a.hints) &&
    Array.isArray(a.mistakes)
  );
}

function isTutorialCompletion(x: unknown): x is TutorialCompletion {
  if (typeof x !== 'object' || x === null) return false;
  const t = x as Record<string, unknown>;
  return (
    t.v === 1 &&
    typeof t.id === 'string' &&
    (CIPHER_IDS as readonly unknown[]).includes(t.cipher) &&
    typeof t.completedAt === 'number' &&
    typeof t.durationMs === 'number' &&
    typeof t.guidedPuzzleSolved === 'boolean' &&
    typeof t.hintsUsed === 'number'
  );
}

const emptyLog = (): Persisted => ({ v: 1, attempts: [], aggregates: {}, tutorials: [] });

export class AttemptLog {
  private data: Persisted;

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly maxPerCipher: number = DEFAULT_MAX_PER_CIPHER,
  ) {
    this.data = this.load();
  }

  private load(): Persisted {
    const raw = this.storage.getItem(ATTEMPTS_KEY);
    if (raw === null) return emptyLog();
    try {
      const parsed = JSON.parse(raw) as Partial<Persisted>;
      if (parsed.v !== 1 || !Array.isArray(parsed.attempts)) throw new Error('unknown format');
      return {
        v: 1,
        attempts: parsed.attempts.filter(isAttempt),
        aggregates: parsed.aggregates ?? {},
        tutorials: Array.isArray(parsed.tutorials) ? parsed.tutorials.filter(isTutorialCompletion) : [],
      };
    } catch {
      // Keep the unreadable data so nothing is silently destroyed, then start fresh.
      this.storage.setItem(`${ATTEMPTS_KEY}:unreadable`, raw);
      return emptyLog();
    }
  }

  private save(): void {
    this.storage.setItem(ATTEMPTS_KEY, JSON.stringify(this.data));
  }

  add(attempt: Attempt): void {
    if (!isAttempt(attempt)) throw new TypeError('Invalid attempt record');
    this.data.attempts.push(attempt);
    const forCipher = this.data.attempts.filter((a) => a.cipher === attempt.cipher);
    const overflow = forCipher.length - this.maxPerCipher;
    if (overflow > 0) {
      const oldest = forCipher.sort((x, y) => x.startedAt - y.startedAt).slice(0, overflow);
      const drop = new Set(oldest);
      let agg = this.data.aggregates[attempt.cipher] ?? emptyAggregate();
      for (const a of oldest) agg = addTo(agg, a);
      this.data.aggregates[attempt.cipher] = agg;
      this.data.attempts = this.data.attempts.filter((a) => !drop.has(a));
    }
    this.save();
  }

  list(filter: { cipher?: CipherId; mode?: Mode } = {}): Attempt[] {
    return this.data.attempts.filter(
      (a) => (!filter.cipher || a.cipher === filter.cipher) && (!filter.mode || a.mode === filter.mode),
    );
  }

  /** Lifetime totals for a cipher: rolled-up history plus raw attempts still stored. */
  summary(cipher: CipherId): Aggregate {
    let agg = this.data.aggregates[cipher] ?? emptyAggregate();
    for (const a of this.list({ cipher })) agg = addTo(agg, a);
    return agg;
  }

  addTutorialCompletion(completion: TutorialCompletion): void {
    if (!isTutorialCompletion(completion)) throw new TypeError('Invalid tutorial completion record');
    this.data.tutorials.push(completion);
    this.save();
  }

  tutorialCompletions(cipher?: CipherId): TutorialCompletion[] {
    return this.data.tutorials.filter((t) => !cipher || t.cipher === cipher);
  }

  hasCompletedTutorial(cipher: CipherId): boolean {
    return this.data.tutorials.some((t) => t.cipher === cipher);
  }

  clear(): void {
    this.data = emptyLog();
    this.storage.removeItem(ATTEMPTS_KEY);
  }
}
