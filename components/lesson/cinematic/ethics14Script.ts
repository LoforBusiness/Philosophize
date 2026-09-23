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
  /** 1 = a scatter of short marks crosses the open ground, showing anyone free to act as they judge necessary. */ license?: number;
  /** 1 = a small tag reading NOT THE ISSUE appears over the pile, marking freedom itself as fine on its own. */ notBad?: number;
  /** 1 = two small marks point in from the open ground toward the figure, showing others' freedom aimed back at him. */ aimed?: number;
}

export const BEATS: Eth14Beat[] = [
  {
    g: 164, built: 0,
    dur: 3.6,
    text: 'Imagine a condition with no laws, no police and no government. Hobbes and Locke call it the state of nature.',
  },
  {
    g: 164, built: 0, license: 1,
    dur: 1.8,
    text: 'In it, you may do whatever you judge necessary, and so may everyone else.',
  },
  {
    g: 13, built: 0, notBad: 1,
    dur: 3.1,
    text: 'Hobbes argues that everyone should leave this condition. The case for leaving is not that freedom is bad.',
    cite: 'The state of nature',
  },
  {
    g: 266, built: 0, aimed: 1,
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
      prompt: 'Which of these do Hobbes and Locke disagree about?',
      odd: {
        axis: 'THEY AGREE ON THREE',
        tiles: [
          { id: 'state', reads: 'THAT THERE SHOULD BE A STATE' },
          { id: 'worse', reads: 'THAT LIFE WITHOUT ONE IS WORSE' },
          { id: 'consent', reads: 'THAT IT RESTS ON CONSENT' },
          { id: 'resist', reads: 'WHETHER YOU MAY RESIST IT', correct: true },
        ],
      },
      explain: 'Whether you may resist it. Both start from a state of nature and reach a deal to be ruled. They split on what comes next. Hobbes leaves almost no room to resist; Locke says a state that breaks its trust may be resisted.',
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
