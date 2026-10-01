import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic personal-growth-foundations-3, "How to Set a Goal That Works" — the third
// lesson on the Personal Growth road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A PARK RUNNING TRACK, A STOPWATCH, AND A NOTICEBOARD.
//
// Three people talk, and nobody narrates. A runner-to-be (the woman with the bun) sets
// the same New Year goal she set last year; her friend (the plain mascot) remembers;
// the coach (the top hat) shows what turns a wish into a goal that gets done.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: a goal is specific, so you can
// tell when it is done · the first step is small enough to start today · write down
// when and where, and put it where you will see it.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Growth3Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * wish — the runner pins a card saying GET FIT to the noticeboard beside last year’s
   *   cards, walks along to her friend’s end of it, and stretches ·
   * again — her friend, on the bench, looks up from his newspaper ·
   * arrive — the coach jogs in along the track with a stopwatch on a cord, tips his
   *   hat and lays a finger on her card ·
   * lap — he points along the track, then holds up the stopwatch ·
   * easy — the runner looks down the track, hands on her hips ·
   * step — the coach takes the RUN ONE LAP card down and pins it over GET FIT ·
   * when — the friend folds his newspaper and taps his wrist ·
   * write — the coach points across the board at the calendar, by which a pen hangs on
   *   a string ·
   * plan — the runner takes the pen, rings Tuesday on the calendar, then sets off along
   *   the track as the coach starts the stopwatch ·
   * rest — she is off on her lap; the stopwatch runs under the quotation.
   */
  act?: 'wish' | 'again' | 'arrive' | 'lap' | 'easy' | 'step' | 'when' | 'write' | 'plan' | 'rest';
  /** The coach is on the stage. He jogs in on `arrive`. */
  th?: boolean;
  /** The noticeboard: 0 only last year’s cards · 1 GET FIT pinned beside them · 2 RUN ONE LAP pinned over it. */
  card?: number;
  /** The calendar: 0 blank · 1 Tuesday written in. */
  diary?: number;
  /** First question on the stage: the three goal cards on the noticeboard are the things to tap. */
  check?: boolean;
  /** Second question on the stage: the calendar, her water bottle and the bin are the things to tap. */
  place?: boolean;
}

export const BEATS: Growth3Beat[] = [
  {
    act: 'wish', card: 1, diary: 0,
    speaker: 'bun',
    text: 'This year, I’m getting fit! I’ll start properly once the weather’s warmer.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'again', card: 1, diary: 0,
    speaker: 'plain',
    text: 'Same goal as last year, I believe. And the year before that.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, card: 1, diary: 0,
    speaker: 'tophat',
    text: 'Getting fit is a wish, not a goal. A goal is specific, so you can tell when you’ve done it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'lap', th: true, card: 1, diary: 0,
    speaker: 'tophat',
    text: 'Run once round this track without stopping. That one you can check, today, with a stopwatch.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, card: 1, diary: 0, check: true,
    interact: {
      prompt: 'Which goal on the board could she check she had done?',
      explain: 'Run one lap. You can watch it happen and time it. Get fit and be healthier are good wishes, but nobody can tell when they’re finished.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'easy', th: true, card: 1, diary: 0,
    speaker: 'bun',
    text: 'Only one lap? That sounds almost too easy, to be honest.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'step', th: true, card: 2, diary: 0,
    speaker: 'tophat',
    text: 'Good. Make the first step small enough to start today, then make it a little bigger each week.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'when', th: true, card: 2, diary: 0,
    speaker: 'plain',
    text: 'And when is this lap happening, then? I only ask.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'write', th: true, card: 2, diary: 0,
    speaker: 'tophat',
    text: 'That’s the last part. Write down when and where, and put it somewhere you’ll see it every day.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, card: 2, diary: 0, place: true,
    interact: {
      prompt: 'Where should she write down when she’ll run?',
      explain: 'The calendar on the board. It says when, and she’ll pass it every day. A note on her water bottle gets lost, and nobody plans anything in a bin.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'plan', th: true, card: 2, diary: 1,
    speaker: 'bun',
    text: 'Tuesday, half past seven, one lap. Oh, I’ll even bring the proper trainers!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, card: 2, diary: 1,
    quote: {
      id: 'lq-personal-growth-foundations-3-1',
      text: 'If a man does not know to which port he is sailing, no wind is favourable.',
      author: 'Seneca',
      work: 'Moral Letters to Lucilius, Letter 71',
      era: 'c. 65',
      branchSlugs: ['personal-growth'],
    },
    dur: 3.0,
  },
  {
    th: true, card: 2, diary: 1,
    summary: {
      title: 'How to Set a Goal That Works',
      points: [
        'Make it specific, so you can tell it’s done',
        'Start with a step small enough for today',
        'Write down when and where, and keep it in sight',
      ],
      closing: 'Next time you make a goal, ask how you’d know it was done.',
    },
    dur: 2.8,
  },
];
