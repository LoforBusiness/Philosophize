import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-16, "Could You Have Done Otherwise?"
//
// THE PICTURE: the same man handing over the same money twice, with the same
// unbroken chain of causes running above his head both times. Exactly one thing
// differs between the two hand-overs, and it is the knife (H64).
//
// Compatibilism is almost impossible to state without sounding like a dodge, and
// the reason is that the sentence "both were caused, only one was free" reads as a
// contradiction. As a picture it is not even surprising: the causal rail is
// identical, the act is identical, and something at his back has gone.
//
// STAGING: the Q1 decoys are the two things a reader reaches for first — the
// causation and the act — and both are drawn identically on purpose, so the answer
// is available by looking rather than by remembering (H66).

export interface Eth16Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** The chain of causes overhead, 0…1. It is 1 from the first beat to the last. */ causes?: number;
  /** The knife at his back, 0…1. */ knife?: number;
  /** Where the money is: 0 in his hand · 1 handed over. */ money?: number;
  /** The label on the box the money goes into: 0 TAKEN · 1 REPAID. */ repaid?: number;
  /** 1 = the three boards are live targets (Q1). */ pick?: number;
  /** 1 = a dashed line drops from the causal rail to the box, showing the chain reaching this act too. */ bound?: number;
  /** 1 = a tag reading FREE appears by the box, naming this unforced act free on Hume's account. */ free?: number;
}

export const BEATS: Eth16Beat[] = [
  {
    g: 435, causes: 1, knife: 1, money: 1,
    dur: 4.4,
    text: 'Suppose a robber holds a knife at your back, and you hand over your wallet. No one would call that act free.',
  },
  {
    g: 379, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 4.8,
    text: 'A week later, you hand a friend the same money to repay a loan. Both acts are the effects of earlier causes.',
    cite: 'The same act, unforced',
  },
  {
    g: 383, causes: 1, knife: 0, money: 1, repaid: 1, bound: 1,
    dur: 4.8,
    text: 'Hard determinists hold that every event, including every choice, is fixed by earlier causes. So neither act was free.',
    cite: 'Hard determinism',
  },
  {
    g: 456, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 3.8,
    quote: {
      id: 'lq-ethics-ethics-16-1',
      text: 'By liberty, then, we can only mean a power of acting or not acting, according to the determinations of the will.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['ethics'],
    },
  },
  {
    g: 412, causes: 1, knife: 0, money: 1, repaid: 1, free: 1,
    dur: 5.0,
    text: 'David Hume defends a smaller notion of freedom, compatible with causation. You act freely when you do as you will and nothing forces you.',
    cite: 'Compatibilism',
  },
  {
    g: 165, causes: 1, knife: 0, money: 1, repaid: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'On Hume’s view, what makes the first act unfree and the second free?',
      explain: 'The knife at his back. Both acts are caused, and both hand over money. What differs is that the first act is forced. On this view, freedom means acting without compulsion, not acting without causes.',
      xp: 5,
    },
  },
  {
    g: 442, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 1.0,
    interact: {
      prompt: 'If every choice is fixed by earlier causes, how much blame survives for a compatibilist?',
      drag: {
        lo: 'NO BLAME LEFT',
        hi: 'BLAME STILL HOLDS',
        start: 0,
        zones: [
          { id: 'none', upto: 0.3, reads: 'no one deserves blame for anything' },
          { id: 'weak', upto: 0.62, reads: 'blame is useful but never deserved' },
          { id: 'keep', upto: 1, reads: 'people are caused and still blameworthy', correct: true },
        ],
      },
      explain: 'People are caused and still blameworthy. Compatibilists take free to mean unforced rather than uncaused: no knife, and no one holding your arm. Kant dismissed this view as a “wretched subterfuge”.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Freedom, Causes and Blame',
      points: [
        'Hard determinists accept the causes and reject blame',
        'Libertarians keep blame and deny that choices are fully caused',
        'Compatibilists say free means unforced, not uncaused',
        'Both hand-overs were caused, and only one was forced',
      ],
      closing: 'For compatibilists, freedom means the absence of compulsion, not the absence of causes.',
    },
    dur: 3.0,
  },
];
