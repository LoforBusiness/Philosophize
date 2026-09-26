import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-1, "Why Does Anything Exist?"
// Theme: A PLANETARIUM SWITCHED OFF, STAR BY STAR.
//
// An operator at the console of a planetarium. The projector throws the sky and each
// idea onto the dome as a lit slide; he turns the dial down until every star is out,
// and the empty dark dome is still there — still something. Then a row of dominoes
// on the floor falls, each knocked by the one before, back to a box nobody explains.
//
// Redrawn 2026-09-25 with the logic debate studio's lessons (solid props, a chrome
// that never mixes React's beat with the shared clock). The narration is unchanged;
// the first question moved onto the stage, where the reader taps the domino, the
// first push or the box.
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
  /** The question is asked ON THE STAGE: tap the domino, the first push, or the box. */
  pick?: boolean;
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
    pick: true,
    interact: {
      prompt: 'Science explains each domino by the one before it. Which question does that leave open?',
      explain: 'Why any exist. The domino before it explains why the last one fell, and an early state explains how the fall began. But every step assumes there are dominoes, and a law that makes them fall. Science presupposes that something exists.',
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
      prompt: 'Put these in order, by how far back the explanation reaches.',
      order: {
        axis: 'LEAST FAR BACK FIRST',
        items: [
          { id: 'stars', reads: 'HOW GALAXIES FORMED' },
          { id: 'early', reads: 'AN EARLY HOT, DENSE STATE' },
          { id: 'why', reads: 'WHY ANYTHING EXISTS' },
        ],
      },
      explain: 'The theory reaches the second and stops. It describes how an early hot, dense state expanded and cooled into galaxies and stars, and says nothing about why there\'s anything for the laws to apply to. That last question isn\'t a gap the theory will later fill.',
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
