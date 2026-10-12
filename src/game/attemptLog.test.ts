import { describe, expect, it } from 'vitest';
import { ATTEMPTS_KEY, AttemptLog, type Attempt, type TutorialCompletion } from './attemptLog';
import { memoryStorage } from './storage';

let n = 0;
function attempt(overrides: Partial<Attempt> = {}): Attempt {
  n += 1;
  return {
    v: 1,
    id: `a${n}`,
    cipher: 'aristocrat',
    difficulty: 'medium',
    mode: 'practice',
    seed: 's',
    startedAt: n,
    durationMs: 1000,
    solved: true,
    errors: 0,
    blanks: 0,
    wrong: [],
    hints: [],
    pointsPossible: 300,
    pointsEarned: 300,
    strict: false,
    mistakes: [],
    ...overrides,
  };
}

describe('AttemptLog', () => {
  it('stores, filters and persists attempts', () => {
    const storage = memoryStorage();
    const log = new AttemptLog(storage);
    log.add(attempt());
    log.add(attempt({ cipher: 'porta', mode: 'mock' }));
    expect(log.list()).toHaveLength(2);
    expect(log.list({ cipher: 'porta' })).toHaveLength(1);
    expect(log.list({ mode: 'mock' })[0]!.cipher).toBe('porta');
    expect(new AttemptLog(storage).list()).toHaveLength(2);
  });

  it('rolls the oldest attempts into an aggregate past the per-cipher cap', () => {
    const log = new AttemptLog(memoryStorage(), 3);
    for (let i = 0; i < 5; i++) log.add(attempt({ solved: i % 2 === 0, errors: 1, hints: ['letter'] }));
    log.add(attempt({ cipher: 'porta' }));
    expect(log.list({ cipher: 'aristocrat' })).toHaveLength(3);
    expect(log.list({ cipher: 'porta' })).toHaveLength(1);
    expect(log.summary('aristocrat')).toEqual({ attempts: 5, solved: 3, totalMs: 5000, errors: 5, hintsUsed: 5 });
  });

  it('keeps the newest attempts when rolling up', () => {
    const log = new AttemptLog(memoryStorage(), 2);
    const ids = [attempt(), attempt(), attempt()].map((a) => (log.add(a), a.id));
    expect(log.list().map((a) => a.id)).toEqual(ids.slice(1));
  });

  it('rejects malformed records', () => {
    const log = new AttemptLog(memoryStorage());
    expect(() => log.add({ ...attempt(), cipher: 'enigma' } as unknown as Attempt)).toThrow(TypeError);
  });

  it('backs up unreadable storage instead of throwing', () => {
    const storage = memoryStorage();
    storage.setItem(ATTEMPTS_KEY, '{not json');
    const log = new AttemptLog(storage);
    expect(log.list()).toEqual([]);
    expect(storage.getItem(`${ATTEMPTS_KEY}:unreadable`)).toBe('{not json');
  });

  it('clear() empties the log and storage', () => {
    const storage = memoryStorage();
    const log = new AttemptLog(storage);
    log.add(attempt());
    log.addTutorialCompletion(tutorial());
    log.clear();
    expect(log.list()).toEqual([]);
    expect(log.tutorialCompletions()).toEqual([]);
    expect(storage.getItem(ATTEMPTS_KEY)).toBeNull();
  });
});

function tutorial(overrides: Partial<TutorialCompletion> = {}): TutorialCompletion {
  n += 1;
  return {
    v: 1,
    id: `t${n}`,
    cipher: 'porta',
    completedAt: n,
    durationMs: 240_000,
    guidedPuzzleSolved: true,
    hintsUsed: 1,
    ...overrides,
  };
}

describe('AttemptLog tutorial completions', () => {
  it('records, filters and persists completions', () => {
    const storage = memoryStorage();
    const log = new AttemptLog(storage);
    expect(log.hasCompletedTutorial('porta')).toBe(false);
    log.addTutorialCompletion(tutorial());
    log.addTutorialCompletion(tutorial({ cipher: 'hill', guidedPuzzleSolved: false }));
    expect(log.hasCompletedTutorial('porta')).toBe(true);
    expect(log.tutorialCompletions('hill')).toHaveLength(1);
    expect(new AttemptLog(storage).tutorialCompletions()).toHaveLength(2);
  });

  it('is never capped by the per-cipher attempt limit', () => {
    const log = new AttemptLog(memoryStorage(), 1);
    for (let i = 0; i < 5; i++) log.addTutorialCompletion(tutorial());
    expect(log.tutorialCompletions('porta')).toHaveLength(5);
  });

  it('rejects malformed completions', () => {
    const log = new AttemptLog(memoryStorage());
    expect(() => log.addTutorialCompletion({ ...tutorial(), hintsUsed: 'two' } as unknown as TutorialCompletion)).toThrow(
      TypeError,
    );
  });

  it('loads logs saved before tutorials were tracked', () => {
    const storage = memoryStorage();
    storage.setItem(ATTEMPTS_KEY, JSON.stringify({ v: 1, attempts: [], aggregates: {} }));
    const log = new AttemptLog(storage);
    expect(log.tutorialCompletions()).toEqual([]);
    log.addTutorialCompletion(tutorial());
    expect(log.hasCompletedTutorial('porta')).toBe(true);
  });
});
