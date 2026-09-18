import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-30, "Does Metaphysics Get Anywhere?"
// Theme: A CAVERN BEING CHARTED, AND A FAR WALL NOBODY HAS REACHED.
//
// The defence of the whole branch is an image its own defenders reach for, so
// the stage draws it: a cave mapped by successive expeditions, where the map
// keeps improving and the far wall is never touched. Both halves have to be on
// screen at once or the picture argues for one side.
//
// The far wall is drawn DASHED for the whole lesson. A dashed edge is a boundary
// rather than a thing, which is the honest way to draw a limit nobody has met.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what is wrong
//     with the charge against metaphysics. On the stage because the cavern is the
//     thing being accused of going nowhere.
//   · beat 8  a PLOT — how much of the cave is charted across the centuries. The
//     passages appear as the curve rises, so a flat line empties the map and
//     says out loud that nothing was ever learned.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics30Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the cavern and the far wall are drawn. */ cave?: number;
  /** How much of the cavern has been charted, 0…1. */ charted?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a bracket marks the far wall — the questions raised since antiquity (group AH). */ wallBracket?: number;
  /** 1 = two dead-end stubs appear in the cavern — the recorded false starts (group AH). */ deadEnds?: number;
  /** 1 = a "?" tag hovers at the far wall — what physics takes for granted (group AH). */ wallQuery?: number;
};

export const BEATS: Metaphysics30Beat[] = [
  {
    p: 341, x: 24, cave: 1, charted: 0.15,
    text: 'Metaphysicians have debated the same questions for two and a half thousand years. Has any of them been answered?',
    dur: 5.0,
  },
  {
    p: 172, x: 24, cave: 1, charted: 0.15, wallBracket: 1,
    text: 'The critic’s charge is that science settles questions and moves on, while metaphysics still debates claims raised in antiquity.',
    dur: 5.0,
  },
  {
    p: 446, x: 24, cave: 1, charted: 0.55,
    text: 'Defenders reply that progress here isn’t a matter of settled questions. It means sharper questions and fewer defensible answers.',
    dur: 5.0,
  },
  {
    p: 264, x: 24, cave: 1, charted: 0.55, deadEnds: 1,
    text: 'Consider an analogy: a cave explored in darkness. Each expedition charts new passages and records the dead ends.',
    dur: 5.0,
  },
  {
    p: 166, x: 24, cave: 1, charted: 0.55, plates: 1, live: 1,
    interact: {
      prompt: 'What is wrong with dismissing metaphysics because its claims can’t be tested?',
      explain: 'It undermines itself. The verification principle says a claim means something only if it can be tested or is true by definition. The principle itself is neither. So by its own test, it means nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 463, x: 80, cave: 1, charted: 0.75,
    text: 'Travellers who come later start from your map rather than from nothing.',
    dur: 4.6,
  },
  {
    p: 444, x: 80, cave: 1, charted: 0.75,
    quote: {
      id: 'lq-metaphysics-being-30-1',
      text: 'Philosophy is to be studied, not for the sake of any definite answers, but rather for the sake of the questions themselves.',
      author: 'Bertrand Russell',
      work: 'The Problems of Philosophy',
      era: '1912',
      philosopherId: 'bertrand-russell',
      branchSlugs: ['metaphysics'],
    },
    dur: 5.0,
  },
  {
    p: 459, x: 80, cave: 1, charted: 0.75, wallQuery: 1,
    text: 'Physics takes time, cause, law and possibility for granted. Working out what these really are is not a job for experiments.',
    dur: 5.0,
  },
  {
    p: 167, x: 80, cave: 1,
    interact: {
      prompt: 'On this analogy, which curve shows how much of the cave has been charted?',
      plot: {
        cols: ['ANTIQUITY', '1600', '1900', 'TODAY'],
        axis: 'HOW MUCH MAPPED',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'climb', profile: [0.16, 0.42, 0.68, 0.92], reads: 'a better map every century', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'the same amount charted in every age' },
          { id: 'fall', profile: [0.9, 0.62, 0.36, 0.12], reads: 'charted early, then steadily forgotten' },
          { id: 'spike', profile: [0.12, 0.9, 0.16, 0.14], reads: 'a peak around 1600, then a collapse' },
        ],
      },
      explain: 'A better map every century. No one has reached the far wall, yet the passages charted since Parmenides are real progress. A flat curve would mean the questions are no clearer now than in antiquity.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 306, x: 80, cave: 1, charted: 0.92,
    summary: {
      title: 'Progress in Metaphysics',
      points: [
        'The charge: metaphysics settles no questions',
        'The defence: progress means clearer questions, not settled ones',
        'The verification principle fails its own test',
        'Metaphysics examines what other fields assume',
      ],
      closing: 'Metaphysics may never close its questions. It can still show which answers are defensible and why.',
    },
    dur: 5.0,
  },
];
