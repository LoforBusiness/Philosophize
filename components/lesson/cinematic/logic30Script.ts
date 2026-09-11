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
    text: 'You’ve spent a whole path taking arguments apart. Now build one on purpose.',
    dur: 4.8,
  },
  {
    p: 170, x: 24, built: 0.4,
    text: 'Start from the conclusion you mean to defend. Then find the premises that would force it.',
    dur: 5.0,
  },
  {
    p: 448, x: 24, built: 0.6,
    text: 'Drag every hidden assumption into the open. An argument leaning on an unstated one is leaning on nothing.',
    dur: 5.0,
  },
  {
    p: 263, x: 24, built: 0.8,
    text: 'Check the form holds, and only then check whether each premise is true.',
    dur: 5.0,
  },
  {
    p: 164, x: 24, built: 0.8, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the course that has to be laid first.',
      explain: 'The conclusion. Everything above it is chosen for the job of forcing it. A builder who starts anywhere else is collecting premises without knowing what they’re for. Hidden assumptions and the stress test both come later.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 466, x: 80, built: 1, swing: 0.5,
    text: 'Now turn on your own work. Where is the weakest premise, and what would a critic aim at?',
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
    text: 'Steelman the objection before anybody else makes it. Build the strongest version and answer that one.',
    dur: 5.0,
  },
  {
    p: 166, x: 80, built: 1, swing: 1,
    interact: {
      prompt: 'What makes an argument hard to knock down?',
      cards: [
        { text: 'You attacked it hardest yourself', correct: true },
        { text: 'Nobody has attacked it yet', correct: false },
      ],
      explain: 'You attacked it hardest yourself. An untested argument is not strong, only unexamined. The first serious critic finds what you never looked for. Every weak point you found is one a stranger can’t use.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 304, x: 80, built: 1, swing: 0.3,
    summary: {
      title: 'Build It and Test It',
      points: [
        'Build backward, from the conclusion to forcing premises',
        'Drag every hidden assumption into the open',
        'Confirm the form holds, then the premises',
        'Attack your own weakest premise first',
      ],
      closing: 'You can build arguments now, and break them. That’s what thinking for yourself comes to.',
    },
    dur: 5.0,
  },
];
