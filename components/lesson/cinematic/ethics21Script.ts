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
  /**
   * 1 = a one-shot cross stamps the point where the means path cuts through
   * the harm box, for "you may not bring about a harm as the means".
   */ forbid?: number;
}

export const BEATS: Eth21Beat[] = [
  {
    p: 462, x: 200, act: 1, arms: 1,
    text: 'A doctor gives enough morphine to stop a patient’s pain. The doctor foresees that the dose will also shorten the patient’s life.',
    dur: 4.6,
  },
  {
    p: 384, x: 200, act: 1, arms: 1, aim: 1,
    text: 'One act has two certain effects. The doctor intends only one of them.',
    cite: 'Intended or foreseen',
    dur: 4.2,
  },
  {
    p: 379, x: 132, act: 1, arms: 1, aim: 1,
    text: 'Thomas Aquinas held that one act can have two effects, one intended and one not. The doctrine of double effect grew from this idea.',
    dur: 4.4,
  },
  {
    p: 380, x: 132, act: 1, arms: 1, aim: 1, live: 1,
    interact: {
      prompt: 'Which outcome does the doctor intend, rather than merely foresee?',
      explain: 'Pain gone. The doctor aims at relief. The shortened life is foreseen with certainty, but it isn’t what the act is for.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, act: 1, arms: 1, aim: 1, means: 1,
    text: 'Now consider a second case with the same two outcomes. Here, the death is the means by which the pain ends.',
    cite: 'Harm as a means',
    dur: 4.6,
  },
  {
    p: 13, x: 268, act: 1, arms: 1, means: 1,
    text: 'The doctrine judges the second case differently. You may accept a harm alongside your aim.',
    dur: 3.4,
  },
  {
    p: 266, x: 268, act: 1, arms: 1, means: 1, forbid: 1,
    text: 'But you may not bring about a harm as the means to your aim.',
    dur: 1.8,
  },
  {
    p: 144, x: 268, act: 1, arms: 1, means: 1,
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
      prompt: 'Put the morphine case in order.',
      order: {
        axis: 'FIRST STEP FIRST',
        items: [
          { id: 'dose', reads: 'THE DOSE IS GIVEN' },
          { id: 'relief', reads: 'THE PAIN LIFTS' },
          { id: 'short', reads: 'THE LIFE IS SHORTENED' },
        ],
      },
      explain: 'The relief is what\'s aimed at; the shortening is foreseen and not intended. The doctrine of double effect turns on that difference, and on the shortening not being the means by which the pain is relieved.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Doctrine of Double Effect',
      points: [
        'One act can have an intended effect and a foreseen one',
        'Double effect permits harm as a side effect, not as a means',
        'Foreseeing something with certainty is not intending it',
        'Philippa Foot argued the line can be hard to draw',
      ],
      closing: 'A surgeon foresees a scar without intending it. The dispute is over how far that distinction extends.',
    },
    dur: 3.4,
  },
];
