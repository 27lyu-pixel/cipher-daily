import type { CipherId, Division, Level, Season } from './ciphers';
import { CURRENT_SEASON } from './ciphers';

/**
 * Competition rules used by mock tests, scoring and strict-conditions mode.
 *
 * `status` records how sure we are of each value:
 *  - confirmed:  matches a published Science Olympiad source for this season
 *  - unofficial: from a secondary source (copies of past rules, study sites)
 *  - placeholder: no source found yet; chosen to model public invitational tests
 */
export type RuleStatus = 'confirmed' | 'unofficial' | 'placeholder';

export interface Sourced<T> {
  value: T;
  status: RuleStatus;
  source: string;
}

export interface CompetitionRules {
  season: Season;
  division: Division;
  level: Level;
  timeLimitMinutes: Sourced<number>;
  maxTeamSize: Sourced<number>;
  /** Errors allowed on a question before points are deducted. */
  errorAllowance: Sourced<number>;
  /** Points deducted for each error beyond the allowance. */
  penaltyPerExtraError: Sourced<number>;
  timedQuestion: Sourced<{
    cipher: CipherId;
    /** Bonus window; after this many seconds the bonus is zero. */
    windowSeconds: number;
    /** bonus = multiplier * (windowSeconds - secondsTaken) */
    bonusMultiplier: number;
    /** Wrong submissions on the timed question may be retried without penalty. */
    retryWithoutPenalty: boolean;
  }>;
  calculators: Sourced<{ max: number; allowedClasses: ('I' | 'II')[] }>;
  notesAllowed: Sourced<boolean>;
  /** The supervisor hands out a reference sheet; contents live in referenceSheet.ts. */
  referenceSheetProvided: Sourced<boolean>;
  questionCount: Sourced<{ min: number; max: number }>;
}

const SCIOLY = 'https://www.scio.ly/docs/codebusters (study guide, 2027 season)';
const SCILYMPIAD = 'https://scilympiad.com/co/Support/ViewKB?qid=00001R and unofficial 2024/2026 rules copies';

export const RULES: CompetitionRules = {
  season: CURRENT_SEASON,
  division: 'C',
  level: 'regional',
  timeLimitMinutes: { value: 50, status: 'unofficial', source: SCIOLY },
  maxTeamSize: { value: 3, status: 'unofficial', source: SCIOLY },
  errorAllowance: { value: 2, status: 'unofficial', source: SCILYMPIAD },
  penaltyPerExtraError: { value: 100, status: 'unofficial', source: 'codebusters-training-center (GitHub), 2026-27' },
  timedQuestion: {
    value: { cipher: 'aristocrat', windowSeconds: 600, bonusMultiplier: 2, retryWithoutPenalty: true },
    status: 'unofficial',
    source: `${SCILYMPIAD}. The 2021 rules used a multiplier of 4.`,
  },
  calculators: { value: { max: 3, allowedClasses: ['I', 'II'] }, status: 'unofficial', source: SCIOLY },
  notesAllowed: { value: false, status: 'unofficial', source: SCIOLY },
  referenceSheetProvided: { value: true, status: 'unofficial', source: SCIOLY },
  questionCount: {
    value: { min: 20, max: 30 },
    status: 'placeholder',
    source: 'No source yet; tune to match public invitational tests.',
  },
};

export function timedBonus(secondsTaken: number, rules: CompetitionRules = RULES): number {
  const { windowSeconds, bonusMultiplier } = rules.timedQuestion.value;
  if (secondsTaken >= windowSeconds) return 0;
  return bonusMultiplier * (windowSeconds - Math.max(0, Math.floor(secondsTaken)));
}

/** Points for one question given its value and the number of errors in the answer. */
export function questionScore(points: number, errors: number, rules: CompetitionRules = RULES): number {
  const extra = Math.max(0, errors - rules.errorAllowance.value);
  return Math.max(0, points - extra * rules.penaltyPerExtraError.value);
}
