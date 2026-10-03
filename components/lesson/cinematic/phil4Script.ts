import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic philosophy-foundations-4, "How Do You Know?" — the fourth lesson on the
// Philosophy road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A RAILWAY PLATFORM, A STOPPED STATION CLOCK, AND A DEPARTURE BOARD.
//
// Two people talk, and nobody narrates (AP13: two is a complete lesson). A traveller
// (the plain mascot) reads the time off a station clock that stopped last night, and is
// right by luck; the philosopher (the top hat) is waiting for the same train and shows
// why being right is not the same as knowing.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: knowing needs a belief that is
// true · and a good reason behind it · a lucky guess is not knowledge, even when it is
// right.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Phil4Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * glance — the traveller walks onto the platform, glances up at the station clock and taps his ticket ·
   * stopped — the philosopher, waiting by the bench, points up at the clock, whose second hand never moves ·
   * right — the traveller spreads his hands toward the clock, pleased with himself ·
   * reason — the philosopher counts the two parts on his fingers, belief and then reason ·
   * luck — he flips a coin and catches it, then nods at the clock ·
   * sulk — the traveller folds his arms, turns his back on him, and turns round again to hear the answer ·
   * check — the philosopher points along the platform to the departure board ·
   * board — the traveller walks to the board, reads it and holds up his ticket beside it ·
   * rest — both at ease under the quotation, the train’s lamp coming into view.
   */
  act?: 'glance' | 'stopped' | 'right' | 'reason' | 'luck' | 'sulk' | 'check' | 'board' | 'rest';
  /** The departure board has been read: 0 not yet · 1 the traveller has walked to it and read it. */
  read?: number;
  /** First question on the stage: the stopped clock, the departure board and the traveller’s ticket are the things to tap. */
  lucky?: boolean;
  /** Second question on the stage: the departure board, the stopped clock and the platform sign are the things to tap. */
  source?: boolean;
}

export const BEATS: Phil4Beat[] = [
  {
    act: 'glance', read: 0,
    speaker: 'plain',
    text: 'Quarter past nine, and my train is at half past. I always know these things.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'stopped', read: 0,
    speaker: 'tophat',
    text: 'That clock stopped at quarter past nine last night. Its hands haven’t moved since.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'right', read: 0,
    speaker: 'plain',
    text: 'And yet it’s quarter past nine, so I was right. Again.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'reason', read: 0,
    speaker: 'tophat',
    text: 'Being right isn’t the same as knowing. To know something, your belief must be true, and you need a good reason for it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    read: 0, lucky: true,
    interact: {
      prompt: 'His belief was true. What made it a lucky guess instead of knowledge?',
      explain: 'The stopped clock. It says quarter past nine all day, so it gave him no real reason. The board and his ticket are good reasons, and he hadn’t looked at either.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'luck', read: 0,
    speaker: 'tophat',
    text: 'A lucky guess can be true. Luck isn’t a reason, though, so a lucky guess isn’t knowledge.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'sulk', read: 0,
    speaker: 'plain',
    text: 'So I was right, and it doesn’t count. What a tragedy.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'check', read: 0,
    speaker: 'tophat',
    text: 'It counts once you check. Go and read the board, please, while I’m still young.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'board', read: 1,
    speaker: 'plain',
    text: 'Half past nine, on time. Now I know it, and I’d like that written down somewhere.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    read: 1, source: true,
    interact: {
      prompt: 'Which of these gives him a good reason to think his train is on time?',
      explain: 'The departure board. It’s updated all the time, so it tracks the trains. The clock never moves, and the platform sign only says where trains stop.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'rest', read: 1,
    quote: {
      id: 'lq-philosophy-foundations-4-1',
      text: 'It is very easy to give examples of true beliefs that are not knowledge.',
      author: 'Bertrand Russell',
      work: 'Human Knowledge: Its Scope and Limits',
      era: '1948',
      branchSlugs: ['philosophy'],
    },
    dur: 3.0,
  },
  {
    read: 1,
    summary: {
      title: 'How Do You Know?',
      points: [
        'Knowing needs a belief that’s true',
        'It also needs a good reason behind it',
        'A lucky guess isn’t knowledge, even when it’s right',
      ],
      closing: 'Next time you’re sure of something, ask what your reason is.',
    },
    dur: 2.8,
  },
];
