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
  /** 1 = a tag over the gap names the plank as the argument being voiced. */ assert?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Logic28Beat[] = [
  {
    p: 426, x: 24, piers: 1,
    text: 'An argument by analogy rests on one claim: two cases are alike, so they should be treated alike.',
    dur: 4.8,
  },
  {
    p: 175, x: 24, piers: 1, span: 0.55,
    text: 'An argument by analogy is inductive. Its conclusion is never certain, and the argument is only as strong as the likeness it rests on.',
    dur: 5.0,
  },
  {
    p: 439, x: 24, piers: 1, span: 0.9,
    text: 'An analogy is strong when the cases share features relevant to the conclusion. It’s weak when the shared features are superficial.',
    dur: 5.0,
  },
  {
    p: 262, x: 24, piers: 1, span: 0.25,
    text: 'A single relevant difference can defeat the whole argument. Such a difference is called a disanalogy.',
    dur: 4.6,
  },
  {
    p: 168, x: 24, piers: 1, span: 0.25, plates: 1, live: 1,
    interact: {
      prompt: 'What makes an argument by analogy strong?',
      explain: 'Features that matter. Two cases can share many features that have nothing to do with the conclusion, so the count doesn’t decide it. A vivid comparison may persuade without giving support.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 455, x: 80, piers: 1, span: 0.9,
    text: 'Judith Jarvis Thomson builds an analogy about abortion. She likens a pregnancy from rape to being tied to a violinist who needs your body to live.',
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
    p: 451, x: 80, piers: 1, span: 0.9, assert: 1,
    text: 'Suppose someone argues that banning hate speech is justified because falsely shouting fire in a theatre is banned.',
    dur: 5.0,
  },
  {
    p: 170, x: 80, piers: 1,
    interact: {
      prompt: 'How far does the fire case carry over to hate speech?',
      sort: {
        chip: 'THE ANALOGY',
        bins: [
          { id: 'none', label: 'IT BREAKS', reads: 'a relevant difference stops it carrying over', correct: true },
          { id: 'some', label: 'SOME SUPPORT', reads: 'similar enough to lend some support' },
          { id: 'same', label: 'THE SAME CASE', reads: 'relevantly the same, so it carries over whole' },
        ],
      },
      explain: 'A relevant difference stops it. Shouting fire works through panic before anyone can think, which is what makes the case easy; speech that\'s heard, understood and rejected doesn\'t work that way. An analogy is only as strong as the feature the two cases share.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 80, piers: 1, span: 0.6,
    summary: {
      title: 'Arguments by Analogy',
      points: [
        'An analogy argues from a likeness to a conclusion',
        'Strength comes from likenesses relevant to the conclusion',
        'One relevant difference, a disanalogy, can defeat it',
        'A vivid comparison is not the same as evidence',
      ],
      closing: 'To assess an analogy, identify the likeness it relies on and ask whether that likeness is relevant.',
    },
    dur: 5.0,
  },
];
