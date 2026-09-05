import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-12, "Is There a 'Self' at All?" — a CONVERSION of an
// existing card deck, at the Metaphysics frontier (§5).
//
// THE PICTURE: a stream of perceptions that never stops running, and beneath it a box
// drawn for the owner — which stays empty for the whole lesson. Hume's result is not
// asserted anywhere; it is just the fact that nothing ever appears in that box (H64).
//
// STAGING: the app's first CONTINUOUS STREAM — content that scrolls the entire time
// rather than moving between beats — and the answer targets are the stream, the empty
// box, and the cynic's plate (E33).

export interface Meta12Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** 1 = the box drawn for the owner is on stage. */ owner?: number;
  /** 1 = the "nothing at all" answer is on the table. */ none?: number;
  /** 1 = the three answers are live targets (Q1). */ pick?: number;
}

export const BEATS: Meta12Beat[] = [
  {
    g: 160, owner: 0, none: 0,
    dur: 3,
    text: 'Look inward right now. There is a warmth, a sound, a thought about tomorrow, another thought about this sentence.',
  },
  {
    g: 160, owner: 0, none: 0,
    dur: 1.8,
    text: 'The stream is easy to find.',
  },
  {
    g: 2, owner: 1, none: 0,
    dur: 3.5,
    text: 'Descartes says something is having them. Doubt everything you like: somebody is doing the doubting. That thinker is one continuing thing.',
    cite: 'A box for the owner',
  },
  {
    g: 2, owner: 1, none: 0,
    dur: 1.8,
    text: 'So: a box for the owner.',
  },
  {
    g: 159, owner: 1, none: 0,
    dur: 3.9,
    text: 'Hume went looking and reported back that he could never catch it. Every time he tried, he found another perception instead.',
    cite: 'Hume looked',
  },
  {
    g: 415, owner: 1, none: 0,
    dur: 1.8,
    text: 'The box stays empty.',
  },
  {
    g: 139, owner: 1, none: 0,
    dur: 3.6,
    quote: {
      id: 'lq-metaphysics-being-12-2',
      text: 'I never can catch myself at any time without a perception, and never can observe anything but the perception.',
      author: 'David Hume',
      philosopherId: 'david-hume',
      work: 'A Treatise of Human Nature',
      era: '1739',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 8, owner: 1, none: 1,
    dur: 4.8,
    text: 'Buddhism arrives at the same place by another road, and calls the fixed self anatta — an illusion. Which invites the obvious overreach, so let us put it on the table too.',
    cite: 'The overreach',
  },
  {
    g: 384, owner: 1, none: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what is having these experiences.',
      explain: 'The stream. Hume went looking for an owner and found only perceptions; anatta reaches the same place by another road. But notice what neither says — the experiences are plainly there. Only the extra thing underneath is missing.',
      xp: 5,
    },
  },
  {
    g: 11, owner: 1, none: 1,
    dur: 1.0,
    interact: {
      prompt: 'What is left of the self once the owner goes?',
      drag: {
        lo: 'NOTHING AT ALL',
        hi: 'ONE UNCHANGING SOUL',
        start: 1,
        zones: [
          { id: 'none', upto: 0.28, reads: 'nothing, the word names nobody' },
          { id: 'stream', upto: 0.74, reads: 'no owner, and a real stream of experience', correct: true },
          { id: 'soul', upto: 1, reads: 'one unchanging owner sitting behind it all' },
        ],
      },
      explain: 'The middle, and the near end is the false step: reading no permanent soul as nothing at all. Hume keeps his bundle of perceptions and the Buddhist keeps the flow. Both deny the owner. Neither empties the rail.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'A Stream With No Owner',
      points: [
        'The self has three rival theories, not one',
        'Descartes: a single, unchanging soul behind the thoughts',
        'Hume: a bundle of perceptions, and no one holding them',
        'Anatta: the fixed self is a fiction worth seeing through',
      ],
      closing: 'You once asked what keeps the self the same. Now you can ask whether there is a self there to keep.',
    },
    dur: 3.0,
  },
];
