import type { CipherId, Division } from './ciphers';

/**
 * Daily rotation: one featured monoalphabetic puzzle plus four others per day,
 * indexed by weekday (0 = Sunday). Every type active in the division appears at
 * least once a week; schedule.test.ts enforces that against config/ciphers.ts.
 */
export interface DaySchedule {
  featured: 'aristocrat' | 'patristocrat';
  others: [CipherId, CipherId, CipherId, CipherId];
}

export type WeekSchedule = [DaySchedule, DaySchedule, DaySchedule, DaySchedule, DaySchedule, DaySchedule, DaySchedule];

export const SCHEDULE: Partial<Record<Division, WeekSchedule>> = {
  C: [
    /* Sun */ { featured: 'aristocrat', others: ['xenocrypt', 'porta', 'baconian', 'columnar'] },
    /* Mon */ { featured: 'patristocrat', others: ['homophonic', 'nihilist', 'fracmorse', 'checkerboard'] },
    /* Tue */ { featured: 'aristocrat', others: ['cryptarithm', 'xenocrypt', 'porta', 'homophonic'] },
    /* Wed */ { featured: 'patristocrat', others: ['baconian', 'columnar', 'nihilist', 'aristocrat'] },
    /* Thu */ { featured: 'aristocrat', others: ['checkerboard', 'fracmorse', 'cryptarithm', 'xenocrypt'] },
    /* Fri */ { featured: 'patristocrat', others: ['porta', 'homophonic', 'columnar', 'baconian'] },
    /* Sat */ { featured: 'aristocrat', others: ['nihilist', 'checkerboard', 'fracmorse', 'cryptarithm'] },
  ],
  // B: add when Division B support is built.
};
