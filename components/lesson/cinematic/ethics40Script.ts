import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-40, "Can You Wrong the Dead?"
// Theme: A SEALED PROMISE ON A SHELF, AND WHAT IS LEFT FOR IT TO BIND.
//
// The whole question is whether a duty has anything to attach to, so the scene
// draws the attachment and nothing else: a promise up on a shelf, and one tie
// running down out of it. Where that tie lands IS the position — the empty seat,
// the man who made the promise, or nowhere.
//
// Nobody is drawn in the seat, at any beat. Drawing the friend and then removing
// him would make the lesson about a death the reader watched, and the argument is
// about the day after — a want still standing when its owner is not.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what is left to
//     damage. On the stage because the seat is already empty above it, which is
//     half the answer.
//   · beat 8  a POLL — the three positions, and who held each. The reader's own
//     answer moves the far end of the tie, so taking a position is watching the
//     duty find something to hold on to, or fail to.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics40Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the shelf and the sealed promise standing on it are drawn. */ promise?: number;
  /** 1 = the empty seat is drawn. */ seat?: number;
  /** 1 = the tie runs from the promise to whatever it binds. */ tie?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Ethics40Beat[] = [
  {
    p: 355, x: 36,
    text: 'Suppose you promised a dying friend that you’d burn his letters. No one else heard the promise.',
    dur: 4.4,
  },
  {
    p: 170, x: 36, promise: 1,
    text: 'The promise still stands a month later, but the person you made it to has died.',
    dur: 3.6,
  },
  {
    p: 431, x: 36, promise: 1, seat: 1,
    text: 'If you break the promise, it’s hard to say who’s worse off as a result.',
    dur: 4.4,
  },
  {
    p: 262, x: 36, promise: 1, seat: 1,
    text: 'A wrong usually has a victim who can feel its effects. Epicurus held that the dead feel nothing and so can’t be harmed.',
    dur: 4.6,
  },
  {
    p: 171, x: 36, promise: 1, seat: 1, plates: 1, live: 1,
    interact: {
      prompt: 'What remains that breaking the promise could damage?',
      explain: 'His wishes. A wish concerns how events turn out, and events continue after death. The man himself is beyond reach, and choosing nothing would make a secret betrayal harmless.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 454, x: 96, promise: 1, seat: 1,
    text: 'Joel Feinberg calls such a wish a surviving interest. An interest is a stake in how things go, not a feeling.',
    dur: 4.6,
  },
  {
    p: 430, x: 96, promise: 1, seat: 1,
    quote: {
      id: 'lq-ethics-ethics-40-1',
      text: 'That the fortunes of descendants and of all a man\'s friends should not affect his happiness at all seems a very unfriendly doctrine.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Nicomachean Ethics',
      era: 'c. 340 BCE',
      branchSlugs: ['ethics'],
    },
    dur: 4.8,
  },
  {
    p: 439, x: 96, promise: 1, seat: 1,
    text: 'So an interest can be set back by events its owner never lives to see.',
    dur: 4.0,
  },
  {
    p: 176, x: 96, promise: 1, seat: 1, tie: 1,
    interact: {
      prompt: 'Once your friend has died, whose interests does breaking the promise set back?',
      poll: {
        options: [
          { id: 'you', reads: 'the living’s, since only the living have wishes', holders: ['Ernest Partridge'] },
          { id: 'noone', reads: 'no one’s, since the dead have no interests', holders: ['Epicurus', 'James Stacey Taylor'] },
          { id: 'him', reads: 'your friend’s, since some interests survive death', holders: ['Joel Feinberg', 'Thomas Nagel'], correct: true },
        ],
      },
      explain: 'Your friend’s, since some interests survive death. An interest concerns how events turn out, so it can be set back after its owner dies. Denying this leaves a secret breach, unknown to anyone living, harming no one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 343, x: 96, promise: 1, seat: 1,
    summary: {
      title: 'What Survives',
      points: [
        'A wrong seems to need somebody left to injure',
        'Some interests outlast the person who has them',
        'Feinberg holds that defeating such an interest harms the dead',
        'Aristotle held that later events can affect the dead',
      ],
      closing: 'In the letters case, no one would ever learn of a breach. If the promise binds even there, its force doesn’t depend on being observed.',
    },
    dur: 4.4,
  },
];
