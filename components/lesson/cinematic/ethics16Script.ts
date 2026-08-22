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
    g: 13, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 4.8,
    text: 'The hard determinist has to call both of those unfree. The rail above has not changed, so nothing below it can have.',
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
    g: 5, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 5.0,
    text: 'Hume offers a smaller freedom that survives. To act freely is to act from your own wants, with nobody holding your arm.',
    cite: 'A freedom that fits',
  },
  {
    g: 4, causes: 1, knife: 0, money: 1, repaid: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the only thing that differed between the two hand-overs.',
      explain: 'The knife. The causal rail is drawn identically both times because it IS identical, and so is the act. If freedom meant escaping causes there would be nothing on this stage to point at, and the difference everybody can see would have nowhere to live.',
      xp: 5,
    },
  },
  {
    g: 41, causes: 1, knife: 0, money: 1, repaid: 1,
    dur: 1.0,
    interact: {
      prompt: 'Compatibilists say determinism means nobody is ever responsible.',
      cards: [
        { text: 'False — they keep responsibility', correct: true },
        { text: 'True — causes end all blame', correct: false },
      ],
      explain: 'The other card is hard determinism under a borrowed name. Compatibilists accept the causes and keep the blame, because they have moved what freedom means — from "uncaused" to "uncoerced". Whether that is a solution or a change of subject is the live argument.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Free Enough to Be Blamed',
      points: [
        'Hard determinism drops responsibility to keep causation',
        'Libertarians drop full causation to keep responsibility',
        'Compatibilists redefine freedom as acting uncoerced',
        'The prisoner is unfree; the walker is free, and both are caused',
      ],
      closing: 'Freedom was never the absence of causes. Only the absence of the knife.',
    },
    dur: 3.0,
  },
];
