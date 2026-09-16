import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-14, "Why Obey Any Rules at All?"
//
// THE PICTURE: a stack of liberties and an empty plot of ground. Course by course
// the stack is built into a WALL, and what comes back over the wall is order (H64).
// Nothing is added from outside. The wall is made of the pile, and when the pile is
// gone the wall is exactly as tall as what everybody put in.
//
// That is the contract's whole claim in one image, and it is the claim the lesson's
// first question is about: an authority made of surrendered liberty has precisely
// as much as was surrendered, which is a very different thing from a ruler who
// holds power in his own right.
//
// STAGING: Locke's DOOR is cut into the finished wall on beat 3, and it is what the
// deck question turns on — Hobbes and Locke both build; they disagree about whether
// you may ever walk back out.

export interface Eth14Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many courses of the wall are laid, 0…5. The stack holds the rest. */ built?: number;
  /** The doorway cut through the wall, 0…1. */ door?: number;
  /** 1 = the three answer boards are live targets (Q1). */ pick?: number;
}

export const BEATS: Eth14Beat[] = [
  {
    g: 164, built: 0,
    dur: 3.6,
    text: 'Imagine a condition with no laws, no police and no government. Hobbes and Locke call it the state of nature.',
  },
  {
    g: 164, built: 0,
    dur: 1.8,
    text: 'In it, you may do whatever you judge necessary, and so may everyone else.',
  },
  {
    g: 13, built: 0,
    dur: 3.1,
    text: 'Hobbes argues that everyone should leave this condition. The case for leaving is not that freedom is bad.',
    cite: 'The state of nature',
  },
  {
    g: 266, built: 0,
    dur: 1.8,
    text: 'The case is that everyone else has freedom too, and can use it against you.',
  },
  {
    g: 447, built: 5,
    dur: 5.0,
    text: 'The remedy is the social contract. Each person gives up some liberty, provided everyone else does too, and gains order in return.',
    cite: 'The social contract',
  },
  {
    g: 399, built: 5, door: 1,
    dur: 4.8,
    text: 'John Locke adds a right of resistance. People may resist any government going beyond its authority by violating rights.',
    cite: 'The right of resistance',
  },
  {
    g: 144, built: 5, door: 1,
    dur: 3.8,
    quote: {
      id: 'lq-ethics-ethics-14-1',
      text: 'Man is born free, and everywhere he is in chains.',
      author: 'Jean-Jacques Rousseau',
      work: 'The Social Contract',
      era: '1762',
      philosopherId: 'jean-jacques-rousseau',
      branchSlugs: ['ethics'],
    },
  },
  {
    g: 461, built: 5, door: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'On the contract view, what is political authority made from?',
      explain: 'Liberties you gave up. On the contract view, the state’s authority comes from the liberty its citizens surrender. The ruler’s own power is the older view, the divine right of kings, which Locke attacked.',
      xp: 5,
    },
  },
  {
    g: 383, built: 5, door: 1,
    dur: 1.0,
    interact: {
      prompt: 'On what question do Hobbes and Locke disagree?',
      split: {
        left: 'MAY YOU EVER RESIST IT', right: 'SHOULD IT EXIST AT ALL',
        start: 0.04,
        zones: [
          { id: 'build', upto: 0.3, reads: 'whether there should be a state at all' },
          { id: 'both', upto: 0.66, reads: 'partly whether to have a state, partly resistance' },
          { id: 'resist', upto: 1, reads: 'whether citizens may ever resist the state', correct: true },
        ],
      },
      explain: 'Whether citizens may ever resist the state. Hobbes and Locke both think a state is needed. Locke says a government that violates rights forfeits obedience. Hobbes holds that rebellion risks a return to the state of nature, which is worse than any government.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Social Contract',
      points: [
        'Authority is built from liberties people hand over',
        'People trade unlimited liberty for enforceable order',
        'Locke allows resistance to unjust rule, and Hobbes largely does not',
        'Rawls asks you to choose rules not knowing your place',
      ],
      closing: 'No actual person signed the contract. Its defenders ask instead whether you’d have agreed to it.',
    },
    dur: 3.0,
  },
];
