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
    text: 'You promised a dying friend you would burn his letters. Nobody else heard it.',
    dur: 4.4,
  },
  {
    p: 170, x: 36, promise: 1,
    text: 'A month later the promise is still there, and he is not.',
    dur: 3.6,
  },
  {
    p: 431, x: 36, promise: 1, seat: 1,
    text: 'Break the promise and name the person who is worse off. The naming is the hard part.',
    dur: 4.4,
  },
  {
    p: 262, x: 36, promise: 1, seat: 1,
    text: 'Being wronged usually means somebody is left to feel it. Death removes the somebody.',
    dur: 4.6,
  },
  {
    p: 171, x: 36, promise: 1, seat: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what is still there to be damaged.',
      explain: 'What he wanted. It was always a stake in how things would go, and things are still going. The man is the one thing nobody can reach now, and answering nothing makes a secret betrayal harmless — which is the case that started this.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 454, x: 96, promise: 1, seat: 1,
    text: 'Joel Feinberg called it a surviving interest. A want is a stake, not a feeling.',
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
    text: 'A stake can be defeated by things its owner never lives to see.',
    dur: 4.0,
  },
  {
    p: 176, x: 96, promise: 1, seat: 1, tie: 1,
    interact: {
      prompt: 'What does the promise still bind?',
      poll: {
        options: [
          { id: 'you', reads: 'you alone — it is about the person you are', holders: ['the virtue tradition'] },
          { id: 'noone', reads: 'nobody — the duty died with him', holders: ['Epicurus'] },
          { id: 'him', reads: 'him — his surviving wants can still be defeated', holders: ['Aristotle', 'Joel Feinberg'], correct: true },
        ],
      },
      explain: 'Him. The tie has something to hold, because a stake outlives its owner. The character answer is thin rather than false — it makes the promise about you, when you made it about him. Epicurus needs the want to stop when the wanting stops.',
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
        'Wants reach past the life that held them',
        'Defeating a surviving want is a real setback',
        'Aristotle refused to call the dead untouchable',
      ],
      closing: 'The letters case is clean because nobody would ever find out. If the promise still holds there, it was never being held up by an audience.',
    },
    dur: 4.4,
  },
];
