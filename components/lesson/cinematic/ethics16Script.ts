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
}

export const BEATS: Eth16Beat[] = [
  {
    g: 47, causes: 1, knife: 1, money: 1,
    dur: 4.4,
    text: 'A knife at your back, and you hand over the wallet. Nobody has ever thought you did that freely.',
  },
  {
    g: 25, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 4.8,
    text: 'A week later you hand a friend the same notes, repaying a loan. Same hand, same money, same causes running back forever.',
    cite: 'And again, without the knife',
  },
  {
    g: 383, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 4.8,
    text: 'A hard determinist says neither one was free. The chain above your head is the same both times, so nothing under it can be different.',
    cite: 'One answer, and its cost',
  },
  {
    g: 137, causes: 1, knife: 0, money: 1, repaid: 1,
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
    g: 412, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 5.0,
    text: 'Hume keeps a smaller kind of freedom. You act freely when you do what you want and nobody is holding your arm.',
    cite: 'A smaller freedom',
  },
  {
    g: 4, causes: 1, knife: 0, money: 1, repaid: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Both hand-overs are drawn the same. Tap the one thing missing from the second.',
      explain: 'The knife. The chain of causes is drawn the same both times because it IS the same, and your hand does the same thing both times. If being free meant escaping causes, there would be nothing here to point at.',
      xp: 5,
    },
  },
  {
    g: 41, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 1.0,
    interact: {
      prompt: 'Suppose every choice you make was already fixed by earlier causes. Drag to how much blame survives.',
      drag: {
        lo: 'NO BLAME LEFT',
        hi: 'BLAME STILL HOLDS',
        start: 0,
        zones: [
          { id: 'none', upto: 0.3, reads: 'nobody is really to blame' },
          { id: 'weak', upto: 0.62, reads: 'blame is just a useful story' },
          { id: 'keep', upto: 1, reads: 'the causes are real and the blame is too', correct: true },
        ],
      },
      explain: 'The far end. Compatibilists accept every cause and still blame people, because they changed what free means. Free stopped meaning uncaused. It came to mean unforced: no knife, nobody holding your arm. Critics say that changes the subject rather than answering it.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Free Enough to Be Blamed',
      points: [
        'Hard determinists keep the causes and drop the blame',
        'Libertarians keep the blame and deny some of the causes',
        'Compatibilists say free means unforced, not uncaused',
        'Both hand-overs were caused, and only one was forced',
      ],
      closing: 'Freedom was never about escaping causes. It was about the knife.',
    },
    dur: 3.0,
  },
];
