import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic personal-growth-foundations-4, "How to Learn From a Mistake" — the fourth
// lesson on the Personal Growth road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A POTTERY STUDIO, A POTTER’S WHEEL, AND A BUCKET OF WATER.
//
// Three people talk, and nobody narrates. A beginner (the plain mascot) throws his
// first pot, soaks the clay, watches it slump and blames the wheel; the studio's potter
// (the newsboy cap) helps him look; the coach (the top hat) shows how a mistake turns
// into the next, better try.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: a mistake is information about
// what to change · change one thing, then try again · skill grows with each try you
// learn from.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Growth4Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * throw — the beginner scoops water from the bucket onto the clay, then cups the spinning
   *   clay, which rises into a tall pot ·
   * slump — the pot sags and folds over on the wheel; the beginner points at the wheel ·
   * help — the potter presses a finger into the soft fallen wall and shows it dripping ·
   * info — the coach walks in, tips his hat and points at the slumped pot (not at the
   *   bucket: the next beat asks which it was, group O) ·
   * blame — while the beginner talks, the potter carries the slumped pot off the wheel to
   *   his side table (where it stays, for the second question) and sets a fresh ball on
   *   the wheel ·
   * one — the coach holds up one finger, then carries the bucket away from the wheel to
   *   the bottom of the rack ·
   * again — the beginner throws a second pot with dry hands, and it stands ·
   * shelf — the potter points along the shelf of finished pots, then at himself ·
   * grow — the coach points at the fallen pot, then at the standing one, and lifts an
   *   open hand a step higher (the standing pot stays on the wheel, where the second
   *   question asks for it) ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'throw' | 'slump' | 'help' | 'info' | 'blame' | 'one' | 'again' | 'shelf' | 'grow' | 'rest';
  /** The coach is on the stage. He walks in on `info`. */
  coach?: boolean;
  /** What is on the wheel: 0 a fresh lump · 1 the first pot, slumped · 2 the second pot, standing. */
  pot?: number;
  /** First question on the stage: the bucket of water, the wheel and the shelf of pots are the things to tap. */
  wet?: boolean;
  /** Second question on the stage: the slumped first pot, the standing second pot and a pot on the shelf are the things to tap. */
  learned?: boolean;
}

export const BEATS: Growth4Beat[] = [
  {
    act: 'throw', pot: 0,
    speaker: 'plain',
    text: 'Behold. My very first pot, and already a masterpiece.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'slump', pot: 1,
    speaker: 'plain',
    text: 'My pot’s fallen over. That wheel must be broken.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'help', pot: 1,
    speaker: 'cap',
    text: 'Your clay’s too wet, mate. Feel how soft the walls are.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'info', pot: 1, coach: true,
    speaker: 'tophat',
    text: 'Blaming the wheel teaches you nothing. A mistake is information, if you look at what went wrong.',
    pace: 'even',
    dur: 2.1,
  },
  {
    pot: 1, coach: true, wet: true,
    interact: {
      prompt: 'What made his first pot fall over?',
      explain: 'The bucket of water. He soaked the clay, so its walls were too soft to stand. The wheel was turning fine, and the shelf only holds finished pots.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'blame', pot: 0, coach: true,
    speaker: 'plain',
    text: 'Too much water. I’d have spotted that myself, eventually.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'one', pot: 0, coach: true,
    speaker: 'tophat',
    text: 'Then change one thing and try again. Less water, same wheel, and please, less talking.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'again', pot: 2, coach: true,
    speaker: 'plain',
    text: 'My pot is standing. You may all applaud now.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'shelf', pot: 2, coach: true,
    speaker: 'cap',
    text: 'Every pot on that shelf fell over a few times first. Mine certainly did.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'grow', pot: 2, coach: true,
    speaker: 'tophat',
    text: 'That’s how skill grows. Each mistake you learn from makes the next try a little better.',
    pace: 'even',
    dur: 2.1,
  },
  {
    pot: 2, coach: true, learned: true,
    interact: {
      prompt: 'Which pot shows he learned from his mistake?',
      explain: 'The pot standing on the wheel. He changed one thing, less water, and it held its shape. The fallen pot was the mistake, and the shelf pots were made by someone else.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'rest', pot: 2, coach: true,
    quote: {
      id: 'lq-personal-growth-foundations-4-1',
      text: 'Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.',
      author: 'Samuel Beckett',
      work: 'Worstward Ho',
      era: '1983',
      branchSlugs: ['personal-growth'],
    },
    dur: 3.0,
  },
  {
    pot: 2, coach: true,
    summary: {
      title: 'How to Learn From a Mistake',
      points: [
        'A mistake tells you what to change',
        'Change one thing, then try again',
        'Skill grows with each try you learn from',
      ],
      closing: 'Next time something goes wrong, ask what it’s trying to tell you.',
    },
    dur: 2.8,
  },
];
