import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-1, "Why Does Anything Exist?"
// Theme: ERASING THE WORLD TO REACH NOTHING.
//
// A figure under a full sky tries to think his way to pure nothing — he wipes the
// stars away, but a dark void is still something; nothing slips his grip. Then
// science's chain of "because ←" links recedes forever, each state explained by an
// earlier one, never reaching a floor.
//
// Both graded questions come from data/.../why-does-anything-exist.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface MetaBeat extends BaseBeat {
  /** Figure pose: 0 stand · 1 emphatic (wipe) · 2 present · 6 gaze up. */
  hpose?: number;
  /** How much of the sky is erased, 0 (full) → 1 (void). */
  erase?: number;
  /** Leibniz's principle of sufficient reason, carded over the question it forces. */
  rule?: boolean;
  /** The causal chain of "because ←" links is on stage. */
  chain?: boolean;
  /** This beat's answer pushes the regress further. */
  qregress?: 'q1' | 'q2';
}

export const BEATS: MetaBeat[] = [
  {
    hpose: 6,
    text: 'Why is there something rather than nothing? Metaphysics’ most famous question. Brace yourself.',
    dur: 3.4,
  },
  {
    hpose: 2,
    rule: true,
    text: 'Leibniz said nothing is ever just true for no reason. Point that at everything at once. Why this crowded universe rather than an empty one? Nothing would have been simpler, he said, and easier.',
    cite: 'Leibniz, Principles of Nature and Grace §7',
    dur: 4.8,
  },
  {
    hpose: 0,
    rule: true,
    quote: {
      id: 'lq-metaphysics-being-1-1',
      text: 'Why is there something rather than nothing? For nothing is simpler and easier than something.',
      author: 'Gottfried Leibniz',
      philosopherId: 'gottfried-leibniz',
      work: 'Principles of Nature and Grace',
      era: '1714',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.0,
  },
  {
    hpose: 1,
    erase: 0.86,
    text: 'Try to reach it. Parmenides did. Strip away objects, space, time, physics — and a dark empty void is still something. You cannot even think about what is not, because thinking about it makes it a thing.',
    cite: 'Parmenides, On Nature, early 5th c. BCE',
    dur: 5.0,
  },
  {
    hpose: 2,
    chain: true,
    text: 'Science never even tries. It starts mid-game, explaining one state of the world by an earlier one. It has to assume there are states and laws to begin with.',
    dur: 4.4,
  },
  {
    hpose: 2,
    chain: true,
    qregress: 'q1',
    interact: {
      prompt: 'Why can’t science fully answer why anything exists at all?',
      cards: [
        { text: 'It presumes things exist', correct: true },
        { text: 'The Big Bang settled it', correct: false },
      ],
      explain: 'Science explains each state by a prior state and the laws. It presupposes there are laws and states at all — so it never reaches why there is anything to begin with.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 4,
    chain: true,
    qregress: 'q2',
    interact: {
      prompt: 'Drag to how far back the Big Bang story actually explains.',
      drag: {
        lo: 'LAST TUESDAY',
        hi: 'WHY ANYTHING AT ALL',
        start: 0,
        zones: [
          { id: 'stars', upto: 0.32, reads: 'how the galaxies and the stars formed' },
          { id: 'early', upto: 0.72, reads: 'back to one hot dense beginning, and it stops there', correct: true },
          { id: 'why', upto: 1, reads: 'why there is anything here to begin with' },
        ],
      },
      explain: 'It reaches the beginning and stops. The Big Bang describes how an already existing universe grew out of a hot dense state. That state had to be there first. So the story runs out one step short of the question.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Why Existence Is a Puzzle',
      points: [
        'Leibniz: nothing exists without a reason',
        'So why something rather than nothing?',
        'Parmenides: pure nothing can’t be thought',
        'Science explains how, not why',
      ],
      closing: 'Even the ground beneath you now demands an explanation.',
    },
    dur: 2.8,
  },
];
