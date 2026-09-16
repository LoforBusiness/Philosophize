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
  /** Figure pose: 0 stand · 1 emphatic (wipe) · 2 present · 6 gaze up · 100+ the movement catalogue. */
  hpose?: number;
  /** How much of the sky is erased, 0 (full) → 1 (void). */
  erase?: number;
  /** Leibniz's principle of sufficient reason, carded over the question it forces. */
  rule?: boolean;
  /** The causal chain of "because ←" links is on stage. */
  chain?: boolean;
  /** This beat's answer pushes the regress further. */
  qregress?: 'q1' | 'q2';
  /** The question plate's caption: Leibniz, in 1714, called it the first question. */
  first?: boolean;
  /** The sky is tagged NEEDS A REASON: a universe that exists needs one. */
  needs?: boolean;
  /** Parmenides' card: the word NOTHING, written out and then struck through. */
  parm?: boolean;
  /**
   * How far the unanswered "?" boxes behind the chain have receded, 0 → 1. Above 0
   * the head of the chain is lit: why the states and laws exist at all is left open.
   */
  open?: number;
}

export const BEATS: MetaBeat[] = [
  {
    hpose: 6,
    text: 'Why is there something rather than nothing? The question asks about everything that exists, taken as a whole.',
    dur: 2.9,
  },
  {
    hpose: 6,
    first: true,
    text: 'Gottfried Leibniz, in 1714, called it the first question anyone has a right to ask.',
    dur: 1.8,
  },
  {
    hpose: 2,
    rule: true,
    first: true,
    text: 'Leibniz’s principle of sufficient reason says that nothing is true without a reason. Applied to the whole world, it asks why the world exists at all.',
    cite: 'Principles of Nature and Grace',
    dur: 2.3,
  },
  {
    hpose: 2,
    rule: true,
    first: true,
    needs: true,
    text: 'Leibniz argued that nothing is simpler and easier than something. So a universe that exists, rather than none, needs a reason.',
    dur: 2.5,
  },
  {
    hpose: 0,
    rule: true,
    first: true,
    needs: true,
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
    // 257 = THINKING IT OVER, a living hold (moves hold 158). The sky is not wiped
    // on this beat any more: the sentence says only that what is not cannot be
    // thought, which is the Parmenides card, and the wipe is the next sentence's.
    hpose: 257,
    parm: true,
    first: true,
    needs: true,
    text: 'Parmenides, an early Greek philosopher, held that what is not cannot be thought or spoken of.',
    cite: 'Parmenides, On Nature',
    dur: 1.8,
  },
  {
    hpose: 1,
    erase: 0.86,
    parm: true,
    first: true,
    needs: true,
    text: 'Suppose you remove every object, along with space and time. Even the dark void you then picture is still something, because thinking of nothing turns it into a thing.',
    dur: 4.2,
  },
  {
    hpose: 2,
    chain: true,
    first: true,
    needs: true,
    text: 'Science explains each state of the universe by an earlier state, together with the laws of nature.',
    dur: 2.6,
  },
  {
    hpose: 2,
    chain: true,
    open: 0.4,
    first: true,
    needs: true,
    text: 'So every scientific explanation presupposes that states and laws already exist. It can’t explain why they exist at all.',
    dur: 1.8,
  },
  {
    hpose: 2,
    chain: true,
    open: 0.4,
    first: true,
    needs: true,
    qregress: 'q1',
    interact: {
      prompt: 'Why can’t science fully answer why anything exists at all?',
      cards: [
        { text: 'Science presupposes that something exists', correct: true },
        { text: 'The Big Bang already answers it', correct: false },
      ],
      explain: 'Science presupposes that something exists. It explains each state by an earlier state and the laws of nature. Every such explanation assumes that states and laws exist. The Big Bang theory describes one such state, so the theory can’t answer the question.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 4,
    chain: true,
    open: 0.7,
    first: true,
    needs: true,
    qregress: 'q2',
    interact: {
      prompt: 'How far back does the Big Bang theory’s explanation reach?',
      drag: {
        lo: 'THE RECENT PAST',
        hi: 'WHY ANYTHING AT ALL',
        start: 0,
        zones: [
          { id: 'stars', upto: 0.32, reads: 'how the galaxies and the stars formed' },
          { id: 'early', upto: 0.72, reads: 'back to an early hot, dense state', correct: true },
          { id: 'why', upto: 1, reads: 'why anything exists at all' },
        ],
      },
      explain: 'Back to an early hot, dense state. The Big Bang theory describes how the universe expanded and cooled from that state. It doesn’t explain why that state existed. So the explanation stops one step short of the question.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    first: true,
    needs: true,
    summary: {
      title: 'Why Existence Is a Puzzle',
      points: [
        'Leibniz: nothing is true without a sufficient reason',
        'So why is there something rather than nothing?',
        'Parmenides: pure nothing can’t be thought',
        'Science explains states by earlier states, not existence itself',
      ],
      closing: 'If the principle of sufficient reason is true, existence itself needs a reason, and science can’t supply it.',
    },
    dur: 2.8,
  },
];
