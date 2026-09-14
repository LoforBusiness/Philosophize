import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-30, "The Just Society, And The Road There"
// Theme: A STACK OF INJUSTICES BEING TAKEN DOWN, AND A PERFECT SOCIETY DRAWN IN
// DASHES.
//
// The last lesson in the branch is about METHOD, so the stage draws the two
// things a method can aim at: a stack of real wrongs that can be removed one at
// a time, and an ideal nobody has reached. Both are on screen from the first
// beat, because the argument is about where to point rather than what is true.
//
// The ideal is dashed for the whole lesson and never fills in. A blueprint that
// arrived would settle the question the wrong way round.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what Sen's
//     painting analogy shows. On the stage because the stack and the ideal are
//     the two things the analogy is about.
//   · beat 8  a PLOT — how much injustice comes off over time. Blocks leave the
//     stack as the curve rises, so a flat line leaves every wrong standing while
//     the dashed ideal is still exactly where it was.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political30Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the stack and the dashed ideal are drawn. */ stack?: number;
  /** How much of the stack has been cleared, 0…1. */ cleared?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Political30Beat[] = [
  {
    p: 346, x: 24, stack: 1,
    text: 'Theories of justice divide over their target: an ideal of perfect justice, or the removal of existing injustice.',
    dur: 5.0,
  },
  {
    p: 167, x: 24, stack: 1,
    text: 'Ideal theory describes what perfect justice would require. John Rawls begins there and treats it as a guide to reform.',
    dur: 5.0,
  },
  {
    p: 451, x: 24, stack: 1, cleared: 0.2,
    text: 'Non-ideal theory begins from the world as it is. Amartya Sen argues that justice advances by removing manifest injustices.',
    dur: 5.0,
  },
  {
    p: 260, x: 24, stack: 1, cleared: 0.4,
    text: 'In Sen’s analogy, to judge one painting better than another, you do not first need the greatest painting there is.',
    dur: 5.0,
  },
  {
    p: 157, x: 24, stack: 1, cleared: 0.4, plates: 1, live: 1,
    interact: {
      prompt: 'What does Sen’s painting analogy show about judging justice?',
      explain: 'No ideal is needed. Sen’s point concerns method: ranking two social arrangements doesn’t require knowing the best possible one. The analogy assumes that art can be ranked, and it doesn’t show that ideal theory is useless.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 347, x: 80, stack: 1, cleared: 0.6,
    text: 'Sen argues that Adam Smith and Mary Wollstonecraft opposed slavery without needing to agree on perfect justice.',
    dur: 4.6,
  },
  {
    p: 452, x: 80, stack: 1, cleared: 0.6,
    quote: {
      id: 'lq-political-political-30-1',
      text: 'Justice is the first virtue of social institutions, as truth is of systems of thought.',
      author: 'John Rawls',
      work: 'A Theory of Justice',
      era: '1971',
      philosopherId: 'john-rawls',
      branchSlugs: ['political-philosophy'],
    },
    dur: 5.0,
  },
  {
    p: 464, x: 80, stack: 1, cleared: 0.6,
    text: 'Rawls holds that non-ideal theory needs an ideal. Without one, it lacks an aim by which to judge reforms.',
    dur: 4.8,
  },
  {
    p: 161, x: 80, stack: 1,
    interact: {
      prompt: 'Which curve shows how much injustice a series of real reforms removes over time?',
      plot: {
        cols: ['NOW', 'A DECADE', 'A CENTURY', 'FURTHER ON'],
        axis: 'INJUSTICE REMOVED',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'climb', profile: [0.12, 0.4, 0.68, 0.9], reads: 'steady removal, one injustice at a time', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'no change until a blueprint exists' },
          { id: 'leap', profile: [0.06, 0.08, 0.1, 0.95], reads: 'nothing, then perfect justice all at once' },
          { id: 'fall', profile: [0.9, 0.62, 0.36, 0.1], reads: 'each reform adds an injustice back' },
        ],
      },
      explain: 'Steady removal, one injustice at a time. On Sen’s view, each reform makes a society less unjust, even if perfect justice is never defined. The flat curve assumes that nothing improves without a blueprint.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 301, x: 80, stack: 1, cleared: 0.9,
    summary: {
      title: 'Ideal and Non-Ideal Theory',
      points: [
        'Ideal theory describes what perfect justice would require',
        'Non-ideal theory addresses injustice in the actual world',
        'Sen: alternatives can be ranked without a perfect ideal',
        'Rawls: reform needs an ideal to aim at',
      ],
      closing: 'The dispute is whether justice is better pursued by describing an ideal or by comparing real alternatives.',
    },
    dur: 5.0,
  },
];
