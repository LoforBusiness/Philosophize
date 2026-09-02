import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-6, "Can a Thing Survive Change?" — the Ship of Theseus.
// A shipwright swaps rotted planks for new ones, one by one, until no original wood
// remains. Then someone rebuilds a second ship from the old planks — and both have a
// claim. Questions stay A/B/C/D (they're nuanced), the SCENE carries the wonder.

export interface Meta6Beat extends BaseBeat {
  /** Shipwright gesture. */ p?: number;
  /** Plank-swapping intensity 0..1 — drives the working shimmer on the hull. */ swap?: number;
  /** The second ship (rebuilt from old planks) is shown 0..1. */ two?: number;
  /**
   * Fraction of ORIGINAL wood still in the sailing hull, 1 → 0. Drives the chart
   * across the top of the stage and how far each hull course has been re-planked.
   * Monotonically falling, so the graph only ever draws forward.
   */
  orig?: number;
  /**
   * Turns the chart onto the READER 0..1: a tag slides in beneath the plot saying
   * the same curve describes their own cells. Only the "you are the living proof"
   * beat sets it, so the annotation lands exactly when the line is read.
   */
  you?: number;
}

export const BEATS: Meta6Beat[] = [
  {
    p: 2, swap: 0, two: 0, orig: 1,
    text: 'Swap every plank of a ship, one at a time. When none of the first wood is left — is it the same ship, or a new one?',
    dur: 3.6,
  },
  {
    p: 36, swap: 1, orig: 0.06,
    text: 'Athens kept Theseus’s ship for centuries, replacing each rotted plank with a fresh one. In the end, not one original board remained.',
    cite: 'The Ship of Theseus',
    dur: 3.9,
  },
  {
    p: 36, swap: 1, orig: 0.06,
    text: 'Plutarch reports the quarrel it started.',
    dur: 1.8,
  },
  {
    p: 137, swap: 1, orig: 0,
    quote: {
      id: 'lq-metaphysics-being-6-1',
      text: 'All things move and nothing remains still; you cannot step twice into the same stream.',
      author: 'Heraclitus',
      philosopherId: 'heraclitus',
      work: 'Plato, Cratylus 402a',
      era: 'c. 500 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 1, swap: 1, orig: 0,
    text: 'Philosophers split the word "same" in two. Qualitative sameness is sharing every feature, like two new coins.',
    cite: 'Two senses of sameness',
    dur: 2.5,
  },
  {
    p: 1, swap: 1, orig: 0,
    text: 'Numerical sameness is being the one thing you were yesterday. The ship keeps the second and loses the first.',
    dur: 2.7,
  },
  {
    p: 22, swap: 1, orig: 0, you: 1,
    text: 'And you are the living proof. Almost every cell in your body has been replaced since childhood — the toddler in old photos shares barely any matter with you.',
    cite: 'Your own riddle',
    dur: 4.1,
  },
  {
    p: 22, swap: 1, orig: 0, you: 1,
    text: 'Yet you call that child yourself.',
    dur: 1.8,
  },
  {
    p: 4, swap: 1, orig: 0,
    interact: {
      prompt: 'Why does the Ship of Theseus threaten our idea of identity over time?',
      cards: [
        { text: 'Every part can change', correct: true },
        { text: 'Wooden ships rot quickly', correct: false },
      ],
      explain: 'If a thing keeps its identity after every part is replaced, identity cannot rest on the parts alone — which is exactly what makes the case so puzzling.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 5, swap: 0.4, two: 1, orig: 0,
    interact: {
      prompt: 'Slide the seam to divide the claim between the two ships.',
      split: {
        left: 'UNBROKEN USE', right: 'THE ORIGINAL PLANKS',
        start: 0.04,
        zones: [
          { id: 'wood', upto: 0.3, reads: 'the rebuilt one, same wood' },
          { id: 'both', upto: 0.7, reads: 'neither wins, it depends on your test', correct: true },
          { id: 'use', upto: 1, reads: 'the one still sailing, never stopped' },
        ],
      },
      explain: 'The seam belongs in the middle. Each ship holds one half of what we mean by the same ship: one keeps the wood, the other keeps the unbroken use. Push it to either end and you have not found the answer, you have chosen which test counts.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Identity Is Stranger Than It Looks',
      points: [
        'Theseus’s ship: parts replaced, identity questioned',
        'Qualitative versus numerical sameness',
        'Heraclitus: all things flow',
        'You change matter yet stay you',
      ],
      closing: 'Maybe a thing is not its stuff but its story — the unbroken thread tying each stage to the next.',
    },
    dur: 2.8,
  },
];
