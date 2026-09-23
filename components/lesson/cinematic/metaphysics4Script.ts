import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-4, "Can Nothing Truly Exist?" — Parmenides' trap.
//
// The stage is a LEDGER of failed attempts. A void hangs over the figure's head;
// each time it grabs at "nothing", a token drops out and a new ledger row writes
// itself: what you SAID, and what it BECAME. Parmenides then bars the second way
// across the void, and the claim CHANGE IS REAL is struck out.
//
// Prop channels the scene reads: `tokens` (ledger rows revealed), `barred` (the
// slash across what-is-not) and `frozen` (the struck-out claim).
//
// Graded questions are the two from data/.../can-nothing-truly-exist.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Meta4Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** How many ledger rows (grabs at nothing) have been written (0..3). */ tokens?: number;
  /** The slash barring the second way, drawn across the void (0/1). */ barred?: number;
  /** "CHANGE IS REAL" struck out (0/1). */ frozen?: number;
  /** 1 = a one-shot spark travels row 0's arrow, "nothing" turning into "a thought". */ catch1?: number;
  /** 1 = a second ring locks around the void, sealing off the rejected way. */ sealed?: number;
  /** 1 = a tag reading MANY WAYS appears beside the frozen claim — Aristotle's reply. */ manyWays?: number;
}

export const BEATS: Meta4Beat[] = [
  {
    p: 384, tokens: 0,
    text: 'To say “nothing exists” is already to speak about something. Parmenides identified this problem in the fifth century BCE.',
    dur: 3.4,
  },
  {
    p: 275, tokens: 1,
    text: 'Suppose you try to think of nothing. It becomes the object of your thought, and a thought must be about something.',
    cite: 'A self-defeating paradox',
    dur: 3.8,
  },
  {
    p: 275, tokens: 1, catch1: 1,
    text: 'Each attempt to refer to nothing turns it into something, such as the object of a thought.',
    dur: 1.8,
  },
  {
    p: 459, tokens: 2, barred: 1,
    text: 'Parmenides of Elea described two ways of inquiry. One holds that it is, and the other that it is not.',
    cite: 'Parmenides, On Nature',
    dur: 1.8,
  },
  {
    p: 459, tokens: 2, barred: 1, sealed: 1,
    text: 'Parmenides rejects the second way, because what is not can be neither known nor said. So only what is can be real.',
    dur: 3.5,
  },
  {
    p: 128, tokens: 2, barred: 1,
    quote: {
      id: 'lq-metaphysics-being-4-1',
      text: 'You cannot know what is not — that is impossible — nor utter it.',
      author: 'Parmenides',
      philosopherId: 'parmenides',
      work: 'On Nature, fragment 2',
      era: 'c. 475 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.2,
  },
  {
    p: 15, tokens: 3, barred: 1, frozen: 1,
    text: 'This conclusion rules out change. To change, a thing would have to pass into or out of not-being, which Parmenides has excluded.',
    cite: 'Change becomes impossible',
    dur: 3.4,
  },
  {
    p: 258, tokens: 3, barred: 1, frozen: 1, manyWays: 1,
    text: 'So motion itself is false, a mere show put on by the senses. Aristotle later replied that “being” is said in more than one way, including potential and actual being.',
    dur: 1.8,
  },
  {
    p: 165, tokens: 3, barred: 1, frozen: 1,
    interact: {
      prompt: 'What makes the thought of pure non-being self-defeating?',
      cards: [
        { text: 'Naming it turns it into something', correct: true },
        { text: 'Physics shows space is never empty', correct: false },
      ],
      explain: 'Naming it turns it into something. Every thought needs an object, so thinking of what is not treats it as something. Whether space is ever empty is a separate question for physics.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, tokens: 3, barred: 1, frozen: 1,
    interact: {
      prompt: 'Put these in order, from most in it to least.',
      order: {
        axis: 'MOST IN IT FIRST',
        items: [
          { id: 'air', reads: 'AIR, DUST AND LIGHT' },
          { id: 'vacuum', reads: 'SPACE AND FIELDS' },
          { id: 'nothing', reads: 'NO SPACE, NO FIELDS' },
        ],
      },
      explain: 'A vacuum still has space and fields in it. Pump out the air and the region is empty of matter, not of everything. So it falls short of the sheer nothing the question is asking after.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Problem of Non-Being',
      points: [
        'Naming nothing seems to make it something',
        'Parmenides: what-is-not cannot be thought',
        'Parmenides’ argument implies that change is an illusion',
        'Aristotle: “being” has many meanings, not one',
      ],
      closing: 'Nothingness seems a simple idea, yet it has proved very hard to think without treating it as something.',
    },
    dur: 2.8,
  },
];
