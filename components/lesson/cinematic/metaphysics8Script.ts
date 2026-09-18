import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-8, "Are You Free, or Wound Up?" — free will vs
// determinism, taught on a long run of toppling dominoes. The figure WALKS ahead
// of the falling wave, from the far end of the chain down to the one domino that
// carries their name, then turns and pushes the next one themselves. Q1 is
// answered by tapping a card in the scene; Q2 is A/B/C/D in the deck.
//
// Teaching order is strictly ask-before-tell: the reader watches the chain arrive,
// meets the two extremes (hard determinism, libertarian free will), is asked what
// a third camp could possibly mean by "free" BEFORE the word compatibilism is ever
// spoken, then gets the name and Hume's own sentence as the payoff.

export interface Metaphysics8Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 300 = far end of the chain, 140 = under their own domino. */ x?: number;
  /** The whole domino run + its rail, 0..1. */ chain?: number;
  /**
   * The topple FRONT, as a domino index. Every domino with index >= this value is
   * down; the wave sweeps right-to-left, so this number only ever decreases.
   * 13 = all thirteen still standing · 3 = the wave has just taken YOUR CHOICE ·
   * 2 = the figure has pushed the next one over.
   */
  front?: number;
  /** The two end captions on the rail, 0..1. Dropped to 0 while Q1 is up. */ tags?: number;
  /** The YOUR CHOICE tag over domino 3, 0..1. Dropped to 0 while Q1 is up. */ mark?: number;
  /** 1 = the three answer cards are live in the scene (Q1). */ pick?: number;
  /** A "FIXED" tag appears — every event fixed by earlier ones (group AH). 0..1. */ fixedTag?: number;
  /** A token runs from the wave's edge toward YOUR CHOICE, one journey per tap (group AH). 0..1. */ causeFlow?: number;
  /** A "NO OTHER WAY" tag appears — no choice could have gone differently (group AH). 0..1. */ noOtherTag?: number;
  /** A "LONG BEFORE YOU" tag appears — causes reaching back before your birth (group AH). 0..1. */ longBeforeTag?: number;
  /** A "A NEW CHAIN" tag appears — the libertarian's uncaused beginning (group AH). 0..1. */ newChainTag?: number;
  /** A "NOT POLITICS" tag appears — distinct from political libertarianism (group AH). 0..1. */ notPoliticsTag?: number;
  /** A "WHAT MAKES IT FREE?" tag appears — the question before the name (group AH). 0..1. */ freeQTag?: number;
  /** A "YOUR OWN WILL" tag appears — Hume's own condition for freedom (group AH). 0..1. */ ownWillTag?: number;
}

export const BEATS: Metaphysics8Beat[] = [
  {
    p: 164, x: 300, chain: 1, front: 13,
    text: 'Consider the last choice you made. Could events long before your birth have already made it inevitable?',
    dur: 3,
  },
  {
    p: 164, x: 300, chain: 1, front: 13, fixedTag: 1,
    text: 'Determinism holds that every event is fixed by earlier events and the laws of nature.',
    dur: 1.8,
  },
  {
    p: 159, x: 232, chain: 1, front: 9, tags: 1, mark: 1,
    text: 'The causes of your choice began before you existed: your genes, your parents, your upbringing. Each state of the world produced the next.',
    cite: 'A chain of causes',
    dur: 4.3,
  },
  {
    p: 159, x: 232, chain: 1, front: 9, tags: 1, mark: 1, causeFlow: 1,
    text: 'That chain of causes leads, step by step, to the choice you made.',
    dur: 1.8,
  },
  {
    p: 173, x: 232, chain: 1, front: 5, tags: 1, mark: 1,
    text: 'Hard determinism says nobody is ever free. Everything you do was fixed by what came before, so you could not have done otherwise.',
    cite: 'Hard determinism',
    dur: 3.6,
  },
  {
    p: 173, x: 232, chain: 1, front: 5, tags: 1, mark: 1, noOtherTag: 1,
    text: 'On this view, no choice you’ve ever made could have gone differently.',
    dur: 1.8,
  },
  {
    p: 15, x: 140, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'Your own choice is one more event in the chain, fixed by the events before it.',
    cite: 'Your choice',
    dur: 2.8,
  },
  {
    p: 258, x: 140, chain: 1, front: 3, tags: 1, mark: 1, longBeforeTag: 1,
    text: 'Even your proudest choices were settled by causes that began long before your birth.',
    dur: 2.2,
  },
  {
    p: 33, x: 140, chain: 1, front: 3, tags: 1, mark: 1, newChainTag: 1,
    text: 'A second position denies that choices are determined. A free choice, it holds, begins a new chain that no earlier cause fixed.',
    cite: 'Breaking the chain',
    dur: 4,
  },
  {
    p: 260, x: 140, chain: 1, front: 3, tags: 1, mark: 1, notPoliticsTag: 1,
    text: 'This is libertarian free will, which is distinct from political libertarianism.',
    dur: 1.8,
  },
  {
    // 8 (shrug), not 4 (think): the line opens "A third camp shrugs".
    p: 378, x: 200, chain: 1, front: 3, tags: 1, mark: 1,
    text: 'A third position rejects an assumption both sides share: that freedom requires uncaused choices.',
    cite: 'A third way',
    dur: 2.6,
  },
  {
    // 8 (shrug), not 4 (think): the line opens "A third camp shrugs".
    p: 416, x: 200, chain: 1, front: 3, tags: 1, mark: 1, freeQTag: 1,
    text: 'On this view, being caused is compatible with being free. What, then, makes a choice free?',
    dur: 2.2,
  },
  {
    p: 380, x: 200, chain: 1, front: 3, tags: 0, mark: 0, pick: 1,
    interact: {
      prompt: 'On this third view, which condition makes a caused choice free?',
      explain: 'You acted from your own wants. On this view, a choice is free when it comes from the agent’s own desires, without external force. A broken chain is ruled out, because this view accepts that every choice is caused.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 200, chain: 1, front: 3, tags: 1, mark: 1,
    interact: {
      prompt: 'Which view of causation and freedom does the third position take?',
      poll: {
        options: [
          { id: 'gap', reads: 'the chain breaks, and freedom requires the break', holders: ['Robert Kane'] },
          { id: 'hard', reads: 'every link holds, so nobody is free', holders: ['Baron d’Holbach'] },
          { id: 'compat', reads: 'every link holds, and people are still free', holders: ['David Hume', 'Harry Frankfurt'], correct: true },
          { id: 'lost', reads: 'even if the chain breaks, nobody is free', holders: ['Derk Pereboom', 'Galen Strawson'] },
        ],
      },
      explain: 'Every link holds, and people are still free. The third position accepts that every choice is caused, but denies that being caused makes a choice unfree.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 29, x: 140, chain: 1, front: 2, tags: 1, mark: 1,
    text: 'This position is called compatibilism. David Hume and, later, Harry Frankfurt held that free will is compatible with determinism.',
    cite: 'Compatibilism · Hume, Frankfurt',
    dur: 2.7,
  },
  {
    p: 258, x: 140, chain: 1, front: 2, tags: 1, mark: 1, ownWillTag: 1,
    text: 'For Hume, you act freely when your action comes from your own will, not from external constraint.',
    dur: 2.7,
  },
  {
    p: 141, x: 140, chain: 1, front: 2, tags: 1, mark: 1,
    quote: {
      id: 'lq-metaphysics-being-8-1',
      text: 'By liberty, then, we can only mean a power of acting or not acting, according to the determinations of the will.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.8,
  },
  {
    summary: {
      title: 'Determinism and Free Will',
      points: [
        'Determinism: every event is fixed by earlier causes',
        'Hard determinism: you could not have done otherwise',
        'Libertarians: a free choice breaks the causal chain',
        'Compatibilism: free means unforced, not uncaused',
      ],
      closing: 'For the compatibilist, the real question is not whether your choice was caused. It is whether your choice was forced.',
    },
    dur: 3.0,
  },
];
