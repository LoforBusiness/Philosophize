import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic science-foundations-2, "What Makes a Fair Test?" — the second lesson on
// the Science road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: STONE STEPS IN A PARK, TWO PAPER PLANES, AND A TAPE MEASURE ON THE GRASS.
//
// Three people talk, and nobody narrates. The woman with the bun is sure her pointy
// paper plane is the best design there is, and throws it from the top of the steps;
// the man in the newsboy cap, who is happy for her, throws his from the grass; the
// scientist (the top hat) shows them why the race proved nothing yet, and how to make
// it prove something.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: a fair test changes one thing and
// keeps everything else the same · then you know what made the difference · one result
// can be luck, so a test is repeated.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice at the pace its words ask for
// (AP17): its pauses come from its punctuation.
// ─────────────────────────────────────────────────────────────────────────────

export interface Sci2Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * boast — she climbs the steps holding up her pointy plane ·
   * throw — both throw: hers sails off the top step, his drops on the grass near his feet ·
   * claim — she comes down to the bottom step, arms raised in triumph ·
   * arrive — the scientist walks in with a tape measure, tips his hat and points from the top step to the grass ·
   * fair — he lays the tape measure along the grass from the chalk line, and picks her plane up ·
   * line — the cap fetches his plane, toes the chalk line and beckons her over to stand beside him; the scientist floats her plane back to her ·
   * retry — both throw from the line; hers lands just past his ·
   * luck — the scientist licks a finger and holds it up to the breeze; a gust nudges the planes ·
   * tally — the cap hands her a stick of chalk, and she starts a tally on the steps ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'boast' | 'throw' | 'claim' | 'arrive' | 'fair' | 'line' | 'retry' | 'luck' | 'tally' | 'rest';
  /** The scientist is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** Where the throws are made from: 0 she is on the top step · 1 both at the chalk line on the grass. */
  start?: number;
  /** The tape measure: 0 rolled up · 1 laid along the grass. */
  tape?: number;
  /** The chalk tally on the bottom step: how many throws are marked. */
  marks?: number;
  /** First question on the stage: the steps, her plane’s pointy nose and its pink paper are the things to tap. */
  unfair?: boolean;
  /** Second question on the stage: the three rows chalked on the steps are the things to tap. */
  next?: boolean;
}

export const BEATS: Sci2Beat[] = [
  {
    act: 'boast', start: 0, tape: 0, marks: 0,
    speaker: 'bun',
    text: 'Mine has the pointy nose, so it’ll fly the furthest. Watch this!',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'throw', start: 0, tape: 0, marks: 0,
    speaker: 'cap',
    text: 'Off you go, then. Goodness, it went miles, and mine barely made it past my feet!',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'claim', start: 0, tape: 0, marks: 0,
    speaker: 'bun',
    text: 'So that’s settled, then. Pointy noses fly further!',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, start: 0, tape: 0, marks: 0,
    speaker: 'tophat',
    text: 'Not yet, I’m afraid. She threw from the top of the steps, and he threw from the grass.',
    pace: ['brisk', 'even'],
    dur: 2.1,
  },
  {
    act: 'fair', th: true, start: 0, tape: 1, marks: 0,
    speaker: 'tophat',
    text: 'A fair test changes one thing, and keeps everything else the same. Then you know what made the difference.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, start: 0, tape: 1, marks: 0, unfair: true,
    interact: {
      prompt: 'Her plane flew further. Which of these made the race unfair?',
      explain: 'The steps. The pointy nose is the one thing being tested. Throwing from higher up was a second change, so nobody can tell which of the two won the race.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'line', th: true, start: 1, tape: 1, marks: 0,
    speaker: 'cap',
    text: 'Shall we both throw from this line, then? Same paper, same arm, nice and gentle.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'retry', th: true, start: 1, tape: 1, marks: 0,
    speaker: 'bun',
    text: 'Mine won again! Only by a little, but it still won.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'luck', th: true, start: 1, tape: 1, marks: 0,
    speaker: 'tophat',
    text: 'One throw can be luck, a gust or a wobble. Repeat it many times, and the luck starts to cancel out.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, start: 1, tape: 1, marks: 0, next: true,
    interact: {
      prompt: 'Her plane won one fair throw, by a little. What should they do next?',
      explain: 'Throw ten times each. One close result can be a gust of wind. Many throws, measured the same way, show whether the nose makes a difference.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'tally', th: true, start: 1, tape: 1, marks: 2,
    speaker: 'cap',
    text: 'Ten throws each, and we’ll chalk up every one. Lovely day for it!',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'rest', th: true, start: 1, tape: 1, marks: 2,
    quote: {
      id: 'lq-science-foundations-2-1',
      text: 'Extraordinary claims require extraordinary evidence.',
      author: 'Carl Sagan',
      work: 'Cosmos',
      era: '1980',
      branchSlugs: ['science'],
    },
    dur: 3.0,
  },
  {
    th: true, start: 1, tape: 1, marks: 2,
    summary: {
      title: 'What Makes a Fair Test?',
      points: [
        'Change one thing, and keep the rest the same',
        'Then you know what made the difference',
        'Repeat it, because one result can be luck',
      ],
      closing: 'Next time someone says one thing beats another, ask whether the test was fair.',
    },
    dur: 2.8,
  },
];
