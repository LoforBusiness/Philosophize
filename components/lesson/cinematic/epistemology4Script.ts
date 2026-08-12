import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-4, "Where Does Knowledge Come From?".
// The stage is a labelled flow diagram over the two arguers. LEFT panel: an eye,
// sensations travelling along an arrow, and a slate that gets written on — Locke's
// white paper. RIGHT panel: a mind already holding its a-priori furniture (2+2=4,
// A=A, no square circles), glowing. At the end both panels feed DOWN into one box —
// Kant's truce: sense data plus the mind's forms equals experience.
//
// Q1 is answered IN THE SCENE (tap the blank-slate thinker); Q2 stays in the deck.
// Graded questions are the two from data/.../where-does-knowledge-come-from.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi4Beat extends BaseBeat {
  /** Empiricist gesture. */ e?: number;
  /** Rationalist gesture. */ r?: number;
  /** Slate fill 0..1 (sensations written in). */ fill?: number;
  /** Rationalist's innate glow 0..1. */ glow?: number;
  /** Kant's bridge lit (0/1). */ bridge?: number;
}

export const BEATS: Epi4Beat[] = [
  {
    e: 8, r: 4, fill: 0, glow: 0, bridge: 0,
    text: 'Blank mind at birth, or already primed? Two camps, one question, centuries of philosophical war.',
    dur: 3.4,
  },
  {
    e: 2, r: 0, fill: 0.35,
    text: 'Empiricists say nothing is in the mind before you live it. Locke pictured it as blank paper — every idea arriving through sensation and reflection.',
    cite: 'Empiricism — from experience',
    dur: 4.8,
  },
  {
    e: 31, r: 0, fill: 0.85,
    text: 'You learn "hot" by getting burned, "red" by seeing red. Big ideas grow from small sensations, written onto a page that started blank.',
    cite: 'Locke, 1689',
    dur: 4.6,
  },
  {
    e: 20, r: 0, fill: 0.85,
    quote: {
      id: 'lq-epistemology-knowledge-4-1',
      text: 'Let us suppose the mind to be white paper, void of all characters, without any ideas. How comes it to be furnished?',
      author: 'John Locke',
      work: 'An Essay Concerning Human Understanding',
      era: '1689',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    e: 0, r: 11, fill: 0.85, glow: 1,
    text: 'Rationalists fire back: some truths are part of our nature. Descartes and Leibniz held that math and logic are grasped by reason alone — known a priori, prior to the senses.',
    cite: 'Rationalism — from reason',
    dur: 5.0,
  },
  {
    e: 0, r: 19, glow: 1,
    text: 'In Plato’s Meno, an untaught slave boy is led to double a square using only questions. Nobody taught him geometry — so, Plato says, to learn is to recollect what the mind already holds.',
    cite: 'Plato, Meno',
    dur: 5.0,
  },
  {
    e: 2, r: 11, fill: 0.85, glow: 1,
    interact: {
      prompt: 'Which thinker held the mind begins as a blank slate, with no innate principles? Tap the name.',
      explain:
        'Locke called the newborn mind "white paper," filled only through sensation and reflection. Descartes, Plato, and Leibniz argued the reverse — some ideas are innate.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    e: 39, r: 39, fill: 0.85, glow: 1, bridge: 1,
    text: 'Then Kant brokered a truce: both were half right. Raw data pours in through the senses, but the mind’s own forms — space, time, cause — shape it into experience. They need each other.',
    cite: 'Kant’s bridge',
    dur: 5.0,
  },
  {
    e: 0, r: 4, glow: 1, bridge: 1,
    interact: {
      prompt: 'Which claim best fits actual rationalism?',
      cards: [
        { text: 'Some truths need reason alone', correct: true },
        { text: 'All truths come from reason', correct: false },
      ],
      explain: 'Rationalists claim some truths are a priori, not that experience is worthless. The "all" version overshoots their real position.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Empiricists vs. Rationalists',
      points: [
        'Empiricists trace ideas to sensation and reflection',
        'Locke’s white paper: the mind starts blank',
        'Rationalists say reason yields a priori truths',
        'Kant fused experience and the mind’s forms',
      ],
      closing: 'Born primed, or learning from scratch? The question is pure epistemology — how you know anything at all.',
    },
    dur: 2.8,
  },
];
