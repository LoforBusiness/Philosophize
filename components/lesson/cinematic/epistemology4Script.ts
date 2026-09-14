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
    e: 173, r: 4, fill: 0, glow: 0, bridge: 0,
    text: 'Does the mind begin empty, or does it contain some knowledge from birth? Empiricists and rationalists give opposing answers.',
    dur: 3.4,
  },
  {
    e: 2, r: 0, fill: 0.35,
    text: 'John Locke compared the newborn mind to white paper. All its ideas, he argued, come from sensation or from reflection on its own workings.',
    cite: 'Empiricism — from experience',
    dur: 4.2,
  },
  {
    e: 2, r: 0, fill: 0.35,
    text: 'This view is called empiricism. It holds that the materials of all knowledge come from experience.',
    dur: 1.8,
  },
  {
    e: 31, r: 0, fill: 0.85,
    text: 'On Locke’s account, you get the idea of red from seeing red things, and heat from feeling heat. Complex ideas are built by combining such simple ideas.',
    cite: 'Locke, 1689',
    dur: 4.6,
  },
  {
    e: 424, r: 0, fill: 0.85,
    quote: {
      id: 'lq-epistemology-knowledge-4-1',
      text: 'Let us suppose the mind to be white paper, void of all characters, without any ideas. How comes it to be furnished?',
      author: 'John Locke',
      philosopherId: 'john-locke',
      work: 'An Essay Concerning Human Understanding',
      era: '1689',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    e: 158, r: 11, fill: 0.85, glow: 1,
    text: 'Rationalists reply that some knowledge doesn’t depend on experience. Reason alone can establish certain truths.',
    cite: 'Rationalism — from reason',
    dur: 1.8,
  },
  {
    e: 158, r: 11, fill: 0.85, glow: 1,
    text: 'Descartes and Leibniz held that reason alone can grasp the truths of maths and logic. Knowledge that doesn’t rest on experience is called a priori.',
    dur: 3.2,
  },
  {
    e: 158, r: 19, glow: 1,
    text: 'In Plato’s Meno, Socrates questions an untaught boy from Meno’s household about how to double a square. Socrates insists he teaches the boy nothing and only asks questions.',
    cite: 'Plato, Meno',
    dur: 3.2,
  },
  {
    e: 418, r: 19, glow: 1,
    text: 'Plato argues that learning is recollection: the soul already knew these truths before birth.',
    dur: 1.8,
  },
  {
    e: 384, r: 11, fill: 0.85, glow: 1,
    interact: {
      prompt: 'Which of these thinkers held that the mind starts with no innate ideas?',
      explain:
        'John Locke. He called the newborn mind “white paper”, furnished only through sensation and reflection. Descartes, Plato and Leibniz all held that some ideas or knowledge are innate.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    e: 39, r: 39, fill: 0.85, glow: 1, bridge: 1,
    text: 'Immanuel Kant argued that each side was partly right. The content of knowledge does come through the senses.',
    cite: 'Kant’s compromise',
    dur: 2.4,
  },
  {
    e: 39, r: 39, fill: 0.85, glow: 1, bridge: 1,
    text: 'But the mind orders that content through its own forms, space and time, and concepts such as cause. Knowledge needs both.',
    dur: 2.6,
  },
  {
    e: 460, r: 4, glow: 1, bridge: 1,
    interact: {
      prompt: 'How much of human knowledge do rationalists claim is independent of experience?',
      drag: {
        lo: 'NONE OF IT',
        hi: 'ALL OF IT',
        start: 1,
        zones: [
          { id: 'none', upto: 0.28, reads: 'none: all knowledge comes from experience' },
          { id: 'some', upto: 0.72, reads: 'some of it: the rest comes from experience', correct: true },
          { id: 'all', upto: 1, reads: 'all of it: experience teaches nothing' },
        ],
      },
      explain: 'Some of it: the rest comes from experience. Rationalists hold that some truths, such as those of mathematics and logic, are known by reason alone. Rationalism doesn’t deny experience a role. Leibniz, for example, held that truths of fact are known through experience.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Empiricists Versus Rationalists',
      points: [
        'Empiricists trace ideas to sensation and reflection',
        'Locke held that the mind begins as white paper',
        'Rationalists hold that reason alone yields a priori truths',
        'Kant held that knowledge needs both senses and mind',
      ],
      closing: 'Whether any knowledge is a priori remains a central question in epistemology.',
    },
    dur: 2.8,
  },
];
