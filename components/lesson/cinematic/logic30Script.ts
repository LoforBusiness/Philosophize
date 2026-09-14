import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-30, "Build It and Stress-Test It"
// Theme: FIVE COURSES OF ONE ARGUMENT, AND A HAMMER OVER THE TOP.
//
// The whole path has been about taking arguments apart, so the capstone builds
// one in front of the reader and then swings at it. The order the courses arrive
// in IS the method, which is why they are stacked rather than laid in a row.
//
// The hammer is drawn from the first beat and never lands on anybody else's
// work. Turning it on your own argument is the move the lesson is about, and a
// hammer aimed elsewhere would be a different lesson.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps which course goes
//     down first. On the stage because the courses are stacked in front of them
//     and the answer is the bottom one.
//   · beat 8  TWO CARDS — what actually makes an argument hard to knock down.
//     Below the figure on purpose: the claim is about what somebody DID, not
//     about a quantity or a place, and a pick is the honest shape for it (R1).
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic30Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the five courses are laid, 0…1. */ built?: number;
  /** How far the hammer has been drawn back over the stack, 0…1. */ swing?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Logic30Beat[] = [
  {
    p: 343, x: 24, built: 0.2,
    text: 'This unit has analysed arguments by taking them apart. The same tools can be used to build one.',
    dur: 4.8,
  },
  {
    p: 170, x: 24, built: 0.4,
    text: 'Begin with the conclusion you mean to defend. Then find premises that, if true, would guarantee it.',
    dur: 5.0,
  },
  {
    p: 448, x: 24, built: 0.6,
    text: 'Next, make every hidden assumption explicit. A premise left unstated can’t be checked, and it may be false.',
    dur: 5.0,
  },
  {
    p: 263, x: 24, built: 0.8,
    text: 'Check that the argument is valid, then check whether each premise is true. A valid argument with true premises is called sound.',
    dur: 5.0,
  },
  {
    p: 164, x: 24, built: 0.8, plates: 1, live: 1,
    interact: {
      prompt: 'Which part of the argument should be settled first?',
      explain: 'The conclusion. Premises are selected to guarantee the conclusion, so they can’t be selected before the conclusion is fixed. Hidden assumptions and the stress test come later, once the argument exists.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 466, x: 80, built: 1, swing: 0.5,
    text: 'Once the argument is built, test it yourself. Identify its weakest premise and the objection a critic would raise.',
    dur: 5.0,
  },
  {
    p: 446, x: 80, built: 1, swing: 0.5,
    quote: {
      id: 'lq-logic-arguments-30-1',
      text: 'The whole problem with the world is that fools and fanatics are always so certain of themselves, and wiser people so full of doubts.',
      author: 'Bertrand Russell',
      work: 'Mortals and Others',
      era: '1933',
      philosopherId: 'bertrand-russell',
      branchSlugs: ['logic'],
    },
    dur: 5.0,
  },
  {
    p: 461, x: 80, built: 1, swing: 1,
    text: 'Construct the strongest version of each objection and answer that. This practice is called steelmanning.',
    dur: 5.0,
  },
  {
    p: 166, x: 80, built: 1, swing: 1,
    interact: {
      prompt: 'What makes an argument hard to refute?',
      cards: [
        { text: 'You tested it hardest yourself', correct: true },
        { text: 'No one has challenged it yet', correct: false },
      ],
      explain: 'You tested it hardest yourself. An argument no one has challenged is untested, and so its strength is unknown. Each weakness you find and repair is one a critic can no longer exploit.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 304, x: 80, built: 1, swing: 0.3,
    summary: {
      title: 'Building and Testing an Argument',
      points: [
        'Work backwards from the conclusion to premises that guarantee it',
        'Make every hidden assumption explicit',
        'Check validity first, then the truth of each premise',
        'Test your weakest premise against the strongest objection',
      ],
      closing: 'A well-built argument states its assumptions, has a valid form, and has already answered its strongest objection.',
    },
    dur: 5.0,
  },
];
