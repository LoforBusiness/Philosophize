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
    g: 467, owner: 0, none: 0,
    dur: 3,
    text: 'Introspection means attending to your own mind. It finds a stream of experiences, such as a warmth, a sound or a passing thought.',
  },
  {
    g: 467, owner: 0, none: 0,
    dur: 1.8,
    text: 'The question is whether a self exists apart from this stream, as the one who has the experiences.',
  },
  {
    g: 2, owner: 1, none: 0,
    dur: 3.5,
    text: 'René Descartes holds that a single thinking thing has the experiences. Even when doubting everything else, Descartes can’t doubt his own existence.',
    cite: 'Descartes’ thinking thing',
  },
  {
    g: 266, owner: 1, none: 0,
    dur: 1.8,
    text: 'On this view, the self is a thinking substance that persists while its particular thoughts come and go.',
  },
  {
    g: 177, owner: 1, none: 0,
    dur: 3.9,
    text: 'David Hume searched his own mind for a self. Each time, Hume found only a particular perception, never a self that has it.',
    cite: 'Hume’s search',
  },
  {
    g: 415, owner: 1, none: 0,
    dur: 1.8,
    text: 'Hume concluded that a self is nothing but a bundle of perceptions. The place for an owner stays empty.',
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
    g: 378, owner: 1, none: 1,
    dur: 4.8,
    text: 'Buddhist philosophy denies a permanent self in its doctrine of anatta, or not-self. It’s tempting to conclude that, without an owner, there’s no self of any kind.',
    cite: 'Anatta, or not-self',
  },
  {
    g: 384, owner: 1, none: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'If introspection never finds an owner, what is having these experiences?',
      explain: 'The stream itself. Hume searched for an owner of his perceptions and never found one, and the doctrine of anatta also denies one. “Nothing at all” fails, because the experiences themselves still occur.',
      xp: 5,
    },
  },
  {
    g: 165, owner: 1, none: 1,
    dur: 1.0,
    interact: {
      prompt: 'Without an unchanging owner, what is left to call the self?',
      drag: {
        lo: 'NOTHING AT ALL',
        hi: 'ONE UNCHANGING SOUL',
        start: 1,
        zones: [
          { id: 'none', upto: 0.28, reads: 'nothing, the word “self” refers to nothing' },
          { id: 'stream', upto: 0.74, reads: 'a real stream of experience, with no owner', correct: true },
          { id: 'soul', upto: 1, reads: 'one unchanging owner behind every experience' },
        ],
      },
      explain: 'A real stream of experience, with no owner. Hume keeps a bundle of perceptions, and the doctrine of anatta keeps a flow of changing processes. The tempting error reads “no permanent self” as “no self at all”.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Bundle Theory of the Self',
      points: [
        'Introspection finds a stream of experiences',
        'Descartes holds that one thinking substance has them all',
        'Hume finds no owner, only a bundle of perceptions',
        'Anatta denies a permanent self, not experience itself',
      ],
      closing: 'In an appendix of 1740, Hume admitted he couldn’t explain what unites successive perceptions in one consciousness.',
    },
    dur: 3.0,
  },
];
