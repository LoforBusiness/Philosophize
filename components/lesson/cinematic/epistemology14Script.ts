import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-14, "How Do You Know the World Is Real?" — a
// CONVERSION of an existing card deck, at the Epistemology frontier (§5).
//
// THE PICTURE: you, a screen, and the world behind it. Halfway through, the world
// swaps for a vat — and THE SCREEN DOES NOT CHANGE. That is the whole argument, and
// the picture makes it by refusing to move (H64).
//
// STAGING: the answer targets are the three parts of that arrangement, so the reader
// answers by pointing at where in their own situation they are standing (E33).

export interface Epis14Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** 0 = a real world behind the screen · 1 = a vat. */ vat?: number;
  /** 1 = the leap between them is drawn. */ leap?: number;
  /** 1 = the three parts are live targets (Q1). */ pick?: number;
}

export const BEATS: Epis14Beat[] = [
  {
    g: 384, vat: 0, leap: 0,
    dur: 4.0,
    text: 'Indirect realism holds that you perceive the world only through your experience of it. A leap separates what you see from the world.',
  },
  {
    g: 443, vat: 0, leap: 0,
    dur: 4.4,
    text: 'Every check you make on a belief relies on your own experience. So every check happens on this side of the screen, never against the world itself.',
    cite: 'What you can check',
  },
  {
    g: 383, vat: 0, leap: 1,
    dur: 4.4,
    text: 'On this view, the world is not something you observe but something you infer. You reason to it across the leap, from what appears on the screen.',
    cite: 'The leap',
  },
  {
    g: 141, vat: 0, leap: 1,
    dur: 3.6,
    quote: {
      id: 'lq-epistemology-knowledge-14-2',
      text: 'In one sense it must be admitted that we can never prove the existence of things other than ourselves and our experiences.',
      author: 'Bertrand Russell',
      philosopherId: 'bertrand-russell',
      work: 'The Problems of Philosophy',
      era: '1912',
      branchSlugs: ['epistemology'],
    },
  },
  {
    g: 159, vat: 1, leap: 1,
    dur: 3,
    text: 'Now suppose your brain were kept in a vat, and a computer supplied all your experiences. This is the brain-in-a-vat scenario.',
    cite: 'The brain in a vat',
  },
  {
    g: 159, vat: 1, leap: 1,
    dur: 1.8,
    text: 'What appears on the screen doesn’t change. Every experience in the vat would match an experience in the world.',
  },
  {
    g: 461, vat: 1, leap: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which part of this arrangement can you inspect directly?',
      explain: 'What you see. Every check you make relies on your own experience, so it takes place on this side of the screen. The world lies beyond the leap, which experience alone can’t cross.',
      xp: 5,
    },
  },
  {
    g: 165, vat: 1, leap: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which claim about experience does the brain-in-a-vat scenario depend on?',
      poll: {
        options: [
          { id: 'vat', reads: 'a vat could produce all the same experiences', holders: ['Hilary Putnam'], correct: true },
          { id: 'easy', reads: 'dreams and waking life feel different', holders: ['J. L. Austin'] },
          { id: 'same', reads: 'you perceive physical things themselves, not ideas', holders: ['Thomas Reid'] },
          { id: 'odd', reads: 'physical things are only collections of ideas', holders: ['George Berkeley'] },
        ],
      },
      explain: 'A vat could produce all the same experiences. The scenario depends on this, because all your evidence would then fit a vat as well as a world.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The World Beyond the Screen',
      points: [
        'Indirect realism: you directly access only your experience',
        'A vat could produce every experience you have',
        'Russell: the external world can’t be strictly proved',
        'Putnam argued that the vat hypothesis refutes itself',
      ],
      closing: 'Experience alone can’t prove that the world is real. It can’t prove that the world is unreal either.',
    },
    dur: 3.0,
  },
];
