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
    text: 'Blank mind at birth, or already primed? Two camps, and they have never once stopped arguing about it.',
    dur: 3.4,
  },
  {
    e: 2, r: 0, fill: 0.35,
    text: 'Locke pictured the newborn mind as a sheet of blank paper. Nothing is on it before you live it, and everything that arrives got there by being seen, felt or thought over. That camp is the empiricists.',
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
    text: 'The other camp fires back. Some things you never had to be shown. Descartes and Leibniz thought maths and logic get worked out by reason alone, before experience gets a say. That is what a priori means.',
    cite: 'Rationalism — from reason',
    dur: 5.0,
  },
  {
    e: 0, r: 19, glow: 1,
    text: 'Plato has Socrates walk an untaught boy through doubling a square, using nothing but questions. Nobody teaches him any geometry. So learning, Plato says, is remembering what was in there already.',
    cite: 'Plato, Meno',
    dur: 5.0,
  },
  {
    e: 2, r: 11, fill: 0.85, glow: 1,
    interact: {
      prompt: 'One of these says you arrive with nothing written on you yet. Tap them.',
      explain:
        'Locke called the newborn mind "white paper," filled only through sensation and reflection. Descartes, Plato, and Leibniz argued the reverse — some ideas are innate.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    e: 39, r: 39, fill: 0.85, glow: 1, bridge: 1,
    text: 'Then Kant brokered a truce, and said both were half right. The raw material does pour in through the senses. But the mind has shapes of its own — space, time, cause — and pours it into those. Neither works alone.',
    cite: 'Kant’s bridge',
    dur: 5.0,
  },
  {
    e: 0, r: 4, glow: 1, bridge: 1,
    interact: {
      prompt: 'Drag to how much a rationalist says comes before experience.',
      drag: {
        lo: 'NONE OF IT',
        hi: 'ALL OF IT',
        start: 1,
        zones: [
          { id: 'none', upto: 0.28, reads: 'nothing; every last thing is learned by looking' },
          { id: 'some', upto: 0.72, reads: 'some of it, and the rest still comes from looking', correct: true },
          { id: 'all', upto: 1, reads: 'all of it; experience teaches nothing' },
        ],
      },
      explain: 'The middle. Rationalists say SOME truths come before experience, not that experience is worthless. The far end is the overshoot, and no rationalist ever made it. The near end is the empiricist standing on the other side of the room.',
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
