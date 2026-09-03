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
    text: 'No laws, no police, nothing above you at all. Every liberty you have is yours to keep.',
  },
  {
    g: 164, built: 0,
    dur: 1.8,
    text: 'So is everybody else\'s.',
  },
  {
    g: 13, built: 0,
    dur: 3.1,
    text: 'That last sentence is the whole problem. The case for leaving is not that freedom is bad.',
    cite: 'The state of nature',
  },
  {
    g: 13, built: 0,
    dur: 1.8,
    text: 'The case is that everyone else has freedom too.',
  },
  {
    g: 45, built: 5,
    dur: 5.0,
    text: 'So you put part of what you hold into a wall, and everyone does the same. What comes back over it is order.',
    cite: 'The bargain',
  },
  {
    g: 399, built: 5, door: 1,
    dur: 4.8,
    text: 'Locke leaves a door in it. If the thing behind the wall turns on you, the deal is void and you may walk out.',
    cite: 'Locke cuts a door',
  },
  {
    g: 137, built: 5, door: 1,
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
    g: 4, built: 5, door: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what the wall is built out of.',
      explain: 'Your liberties. An authority built from what people handed over has exactly as much as they handed over. The board about the ruler\'s own power is the older answer, a king holding it in his own right. Replacing that answer is the whole point.',
      xp: 5,
    },
  },
  {
    g: 41, built: 5, door: 1,
    dur: 1.0,
    interact: {
      prompt: 'Slide the seam to where the real disagreement sits.',
      split: {
        left: 'MAY YOU EVER RESIST IT', right: 'SHOULD IT EXIST AT ALL',
        start: 0.04,
        zones: [
          { id: 'build', upto: 0.3, reads: 'whether to have a state in the first place' },
          { id: 'both', upto: 0.66, reads: 'half about building the state, half about resisting' },
          { id: 'resist', upto: 1, reads: 'whether you may ever resist the one you built', correct: true },
        ],
      },
      explain: 'All of it on the left. Both men want the wall, so no wall at all is nobody position in this argument. They fall out over the door. Locke says a state that turns on you forfeits your obedience; Hobbes says the alternative is worse than anything it does.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Contract',
      points: [
        'Authority is built from liberties people hand over',
        'The trade is total freedom for enforceable order',
        'Hobbes seals the wall; Locke leaves a door',
        'Rawls asks you to choose the rules blind to your place',
      ],
      closing: 'You never signed the wall, and you live behind it anyway. Would you have signed?',
    },
    dur: 3.0,
  },
];
