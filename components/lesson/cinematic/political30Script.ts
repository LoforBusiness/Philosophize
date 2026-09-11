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
    text: 'Picture the perfect society, or abolish the nearest injustice. Every theory meets this question in the end.',
    dur: 5.0,
  },
  {
    p: 167, x: 24, stack: 1,
    text: 'Ideal theory asks what perfect justice would look like. Rawls began there and built the model first.',
    dur: 5.0,
  },
  {
    p: 451, x: 24, stack: 1, cleared: 0.2,
    text: 'Non-ideal theory starts from the world as it is. Amartya Sen asks what to do about the wrongs already standing.',
    dur: 5.0,
  },
  {
    p: 260, x: 24, stack: 1, cleared: 0.4,
    text: 'To judge one painting better than another, you do not first need the greatest painting there is.',
    dur: 5.0,
  },
  {
    p: 157, x: 24, stack: 1, cleared: 0.4, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what the painting analogy is meant to show.',
      explain: 'No perfect ideal is needed. Sen is making a point about method. Comparing two arrangements does not require naming the best one there could be. Art can be ranked, and the argument doesn’t say the ideal is worthless.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 347, x: 80, stack: 1, cleared: 0.6,
    text: 'People suffering now cannot wait for a blueprint that may never arrive.',
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
    text: 'Rawls answers that without a target, reform drifts. A compass is not a fantasy.',
    dur: 4.8,
  },
  {
    p: 161, x: 80, stack: 1,
    interact: {
      prompt: 'Draw how much injustice a run of real reforms takes off.',
      plot: {
        cols: ['NOW', 'A DECADE', 'A CENTURY', 'FURTHER ON'],
        axis: 'HOW MUCH REMOVED',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'climb', profile: [0.12, 0.4, 0.68, 0.9], reads: 'one wrong at a time, and the stack falls', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'nothing shifts until the blueprint arrives' },
          { id: 'leap', profile: [0.06, 0.08, 0.1, 0.95], reads: 'nothing, and then a perfect society' },
          { id: 'fall', profile: [0.9, 0.62, 0.36, 0.1], reads: 'every reform puts a wrong back on' },
        ],
      },
      explain: 'One wrong at a time. Comparative reforms are how a society gets less unjust in practice. Each one is real whether or not perfect justice is ever described. A flat line waits for a blueprint while the stack stays where it is.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 301, x: 80, stack: 1, cleared: 0.9,
    summary: {
      title: 'Blueprint or Repair',
      points: [
        'Ideal theory maps the perfectly just society',
        'Non-ideal theory tackles the injustice standing now',
        'Sen: options can be ranked without a perfect ideal',
        'A just society needs both the vision and the work',
      ],
      closing: 'You have the questions now. A just society is not found, but argued for, and then built.',
    },
    dur: 5.0,
  },
];
