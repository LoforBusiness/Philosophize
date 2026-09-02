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
}

export const BEATS: Meta4Beat[] = [
  {
    p: 2, tokens: 0,
    text: 'Say "nothing exists" and you have said too much. Parmenides found this snag 2,500 years ago — and it still bites.',
    dur: 3.4,
  },
  {
    p: 24, tokens: 1,
    text: 'Try to deny non-being. The moment you think of nothing, you make it the object of a thought — and a thought needs something to be about.',
    cite: 'A self-defeating paradox',
    dur: 3.8,
  },
  {
    p: 24, tokens: 1,
    text: 'Each grab at nothing turns it into a thing.',
    dur: 1.8,
  },
  {
    p: 35, tokens: 2, barred: 1,
    text: 'At Elea he set out two ways. That it is, and that it is not.',
    cite: 'Parmenides, On Nature',
    dur: 1.8,
  },
  {
    p: 35, tokens: 2, barred: 1,
    text: 'Parmenides throws out the second, because what is not can be neither known nor said. So only what is counts as real, and change is a trick of the senses.',
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
    text: 'Follow it and the world freezes. To change, a thing would have to pass into or out of not-being, and that road is closed.',
    cite: 'Change becomes impossible',
    dur: 3.4,
  },
  {
    p: 15, tokens: 3, barred: 1, frozen: 1,
    text: 'So motion itself becomes an illusion. Aristotle later loosened the knot.',
    dur: 1.8,
  },
  {
    p: 4, tokens: 3, barred: 1, frozen: 1,
    interact: {
      prompt: 'Why did Parmenides claim that non-being cannot exist?',
      cards: [
        { text: 'Speaking it makes it something', correct: true },
        { text: 'Science proved space is full', correct: false },
      ],
      explain: 'Every thought and word needs an object. "It is not" fails because what-is-not can be neither known nor said: try to think it, and you quietly convert it into a something.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, tokens: 3, barred: 1, frozen: 1,
    interact: {
      prompt: 'Drag to how empty a physicist\'s vacuum really is.',
      drag: {
        lo: 'FULL OF STUFF',
        hi: 'ABSOLUTELY NOTHING',
        start: 0,
        zones: [
          { id: 'air', upto: 0.3, reads: 'air, dust and light' },
          { id: 'vacuum', upto: 0.74, reads: 'still space and fields, no matter', correct: true },
          { id: 'none', upto: 1, reads: 'nothing at all, never once seen' },
        ],
      },
      explain: 'A vacuum lands short of the far end, and the gap is the point. Empty space still has dimensions and quantum fields, so it is a something with very little in it. The nothing Parmenides means is the far end of the rail, and no experiment has gone there.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Trap of Non-Being',
      points: [
        'Naming nothing seems to make it something',
        'Parmenides: what-is-not cannot be thought',
        'His logic implies change is illusion',
        'Aristotle split "being" into many senses',
      ],
      closing: 'Nothing looks like the simplest idea going, yet it stays one of philosophy’s slipperiest.',
    },
    dur: 2.8,
  },
];
