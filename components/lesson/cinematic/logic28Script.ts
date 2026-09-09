import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-28, "Arguing by Analogy"
// Theme: TWO CASES ON TWO PIERS, AND A PLANK TRYING TO REACH BETWEEN THEM.
//
// An analogy is a crossing, so the stage builds one. Two piers stand a fixed
// distance apart and a plank runs out from the first toward the second; how far
// it gets is how much of the argument actually arrives.
//
// The gap never changes width. That is the point: the cases are as far apart as
// they were before anybody made the comparison, and only the plank can be argued
// about.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what makes an
//     analogy strong. On the stage because the crossing is being built in front
//     of them and the answer is what it has to be built out of.
//   · beat 8  a DRAG — how far one named analogy reaches. The plank runs out with
//     the knob, so a reader who calls the comparison airtight watches a plank
//     land on a pier it has no business reaching.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic28Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two piers and their names are drawn. */ piers?: number;
  /** How far the plank reaches across the gap, 0…1. */ span?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Logic28Beat[] = [
  {
    p: 426, x: 24, piers: 1,
    text: 'Every big argument hides one small claim. Two cases are alike, so treat them alike.',
    dur: 4.8,
  },
  {
    p: 175, x: 24, piers: 1, span: 0.55,
    text: 'An analogy is inductive. Never certain, often strong, and only as good as the likeness it rests on.',
    dur: 5.0,
  },
  {
    p: 439, x: 24, piers: 1, span: 0.9,
    text: 'Strong means many likenesses that bear on the conclusion. Weak means the likeness is only skin deep.',
    dur: 5.0,
  },
  {
    p: 262, x: 24, piers: 1, span: 0.25,
    text: 'One difference that matters can sink the whole argument. The name for it is a disanalogy.',
    dur: 4.6,
  },
  {
    p: 168, x: 24, piers: 1, span: 0.25, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what makes an analogy strong.',
      explain: 'Features that matter. Two things can share a hundred traits that bear on nothing. One relevant difference sinks the argument on its own, and vividness persuades without proving.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 455, x: 80, piers: 1, span: 0.9,
    text: 'Judith Jarvis Thomson imagines you waking up wired to a famous violinist who needs your kidneys.',
    dur: 5.0,
  },
  {
    p: 434, x: 80, piers: 1, span: 0.9,
    quote: {
      id: 'lq-logic-arguments-28-1',
      text: 'You wake up in the morning and find yourself back to back in bed with an unconscious violinist.',
      author: 'Judith Jarvis Thomson',
      work: 'A Defense of Abortion',
      era: '1971',
      branchSlugs: ['logic'],
    },
    dur: 5.0,
  },
  {
    p: 451, x: 80, piers: 1, span: 0.9,
    text: 'Somebody argues that banning hate speech is fine because shouting fire in a theatre is banned.',
    dur: 5.0,
  },
  {
    p: 170, x: 80, piers: 1,
    interact: {
      prompt: 'How far does the fire ban reach into hate speech?',
      drag: {
        lo: 'NO REACH',
        hi: 'ALL THE WAY',
        start: 0.9,
        zones: [
          { id: 'none', upto: 0.35, reads: 'a relevant difference stops the argument', correct: true },
          { id: 'some', upto: 0.7, reads: 'close enough to carry some weight' },
          { id: 'all', upto: 1, reads: 'the same case wearing two names' },
        ],
      },
      explain: 'Hardly at all. Shouting fire threatens bodies, and hate speech states a view, so the likeness that mattered is missing. Different buildings and an old phrase are surface details.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 80, piers: 1, span: 0.6,
    summary: {
      title: 'Alike Here, Alike There',
      points: [
        'An analogy argues from a likeness to a conclusion',
        'Strength comes from likenesses that bear on the point',
        'One relevant difference can sink the whole argument',
        'A vivid comparison is not the same as evidence',
      ],
      closing: 'Before an analogy convinces you, ask which likeness is doing the work, and whether it is the right one.',
    },
    dur: 5.0,
  },
];
