import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-21, "Did You Mean It, Or Just Foresee It?"
// Theme: ONE ACT WITH TWO ARROWS OUT OF IT, AND ONLY ONE WAS AIMED.
//
// Double effect is usually presented as a list of four conditions, which is the
// fastest way to lose a reader. The whole of it is visible in one drawing: an act
// with two outcomes, drawn IDENTICALLY, and a sight-mark on one of them.
//
// Then the second case, which is what makes the doctrine bite: the same two
// outcomes, and this time the bad one is on the path to the good one rather than
// beside it. The arrows change shape and nothing else does.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — two outcomes, tap the one that was aimed at. There
//     is no trick: the sight-mark is drawn. What the reader is learning is that
//     the question can be asked at all.
//   · beat 7  a SPLIT — the reader divides the act between what was intended and
//     what was merely foreseen, and both numbers are on screen. A pick would ask
//     which label applies; the bar asks how much of the act each one covers,
//     which is the thing the doctrine is actually about.
// ─────────────────────────────────────────────────────────────────────────────

export interface Eth21Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The act at the top and its two outcomes, 0…1. */ act?: number;
  /** The two arrows leaving the act, 0…1. */ arms?: number;
  /** The sight-mark on the outcome that was aimed at, 0…1. */ aim?: number;
  /** The second case, where the bad outcome is on the path, 0…1. */ means?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Eth21Beat[] = [
  {
    p: 25, x: 200, act: 1, arms: 1,
    text: 'A doctor gives enough morphine to stop the pain. Everyone knows it will also shorten the life.',
    dur: 4.6,
  },
  {
    p: 2, x: 200, act: 1, arms: 1, aim: 1,
    text: 'Two outcomes, both certain, both from one act. Only one of them was the point.',
    cite: 'Aimed at, or come along with',
    dur: 4.2,
  },
  {
    p: 379, x: 132, act: 1, arms: 1, aim: 1,
    text: 'Aquinas saw that we judge the two arrows in different ways. We do so everywhere, not just in hospitals.',
    dur: 4.4,
  },
  {
    p: 4, x: 132, act: 1, arms: 1, aim: 1, live: 1,
    interact: {
      prompt: 'Tap the outcome the doctor was aiming at.',
      explain: 'Stopping the pain. The shorter life is foreseen with certainty and still not intended, which sounds like a dodge until you notice you already use the distinction. Nobody thinks a surgeon intends the scar.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, act: 1, arms: 1, aim: 1, means: 1,
    text: 'Now the case that tests it. Same two outcomes, except the death is how the relief is achieved.',
    cite: 'On the path, not beside it',
    dur: 4.6,
  },
  {
    p: 13, x: 268, act: 1, arms: 1, means: 1,
    text: 'The doctrine says that one is different. You may accept a harm alongside your aim.',
    dur: 3.4,
  },
  {
    p: 13, x: 268, act: 1, arms: 1, means: 1,
    text: 'You may not walk through it.',
    dur: 1.8,
  },
  {
    p: 137, x: 268, act: 1, arms: 1, means: 1,
    quote: {
      id: 'lq-ethics-ethics-21-1',
      text: 'Nothing hinders one act from having two effects, only one of which is intended, while the other is beside the intention.',
      author: 'Thomas Aquinas',
      philosopherId: 'thomas-aquinas',
      work: 'Summa Theologiae',
      era: '1274',
      branchSlugs: ['ethics'],
    },
    dur: 4.0,
  },
  {
    p: 41, x: 268, act: 1, arms: 1, means: 1,
    interact: {
      prompt: 'Split the morphine case between the two.',
      split: {
        left: 'INTENDED',
        right: 'MERELY FORESEEN',
        start: 0.5,
        zones: [
          { id: 'foreseen', upto: 0.35, reads: 'the relief was incidental' },
          { id: 'both', upto: 0.62, reads: 'you meant both equally' },
          { id: 'intended', upto: 1, reads: 'you meant the relief, and knew the cost', correct: true },
        ],
      },
      explain: 'Mostly intended. The relief is the whole point of the act and the shortened life is a cost you accept without wanting. Splitting it evenly would say you were half aiming at the death, which is the thing the doctor is not doing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Aimed At, Or Accepted',
      points: [
        'One act can have an intended effect and a foreseen one',
        'Double effect permits the harm beside the aim, not the harm as the means',
        'Foreseeing something with certainty is not intending it',
        'Critics say the line is too easy to redescribe your way across',
      ],
      closing: 'Nobody thinks a surgeon intends the scar. The argument is about where that stops.',
    },
    dur: 3.4,
  },
];
