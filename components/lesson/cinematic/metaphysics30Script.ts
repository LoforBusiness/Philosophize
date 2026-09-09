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
};

export const BEATS: Metaphysics30Beat[] = [
  {
    p: 341, x: 24, cave: 1, charted: 0.15,
    text: 'The same questions for two and a half thousand years. Any of them answered yet?',
    dur: 5.0,
  },
  {
    p: 172, x: 24, cave: 1, charted: 0.15,
    text: 'Science settles a question and moves on. Metaphysics is still arguing over claims raised in antiquity.',
    dur: 5.0,
  },
  {
    p: 446, x: 24, cave: 1, charted: 0.55,
    text: 'The defence says progress here does not mean closed cases. It means sharper questions and fewer live options.',
    dur: 5.0,
  },
  {
    p: 264, x: 24, cave: 1, charted: 0.55,
    text: 'Picture a cave mapped in the dark. Each expedition charts new passages and marks the dead ends.',
    dur: 5.0,
  },
  {
    p: 166, x: 24, cave: 1, charted: 0.55, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what is wrong with the charge against metaphysics.',
      explain: 'It undermines itself. Only what science can test is meaningful is not a claim science can test, so the verdict against metaphysics quietly leans on metaphysics. Nothing here says science is shaky or that the answers are in.',
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
    p: 459, x: 80, cave: 1, charted: 0.75,
    text: 'Physics leans on time, cause, law and possibility. Working out what those are is not a physics experiment.',
    dur: 5.0,
  },
  {
    p: 167, x: 80, cave: 1,
    interact: {
      prompt: 'Draw how much of the cave has been charted over the centuries.',
      plot: {
        cols: ['ANTIQUITY', '1600', '1900', 'TODAY'],
        axis: 'HOW MUCH MAPPED',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'climb', profile: [0.16, 0.42, 0.68, 0.92], reads: 'a better map every century', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'the same ground walked again and again' },
          { id: 'fall', profile: [0.9, 0.62, 0.36, 0.12], reads: 'the ancients knew it and later ages forgot' },
          { id: 'spike', profile: [0.12, 0.9, 0.16, 0.14], reads: 'one good century, and then nothing' },
        ],
      },
      explain: 'A better map every century. Nobody has reached the far wall, and the passages charted since Parmenides are real all the same. A flat line would mean the questions are stated no more clearly now than they were then.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 306, x: 80, cave: 1, charted: 0.92,
    summary: {
      title: 'The Verdict on Verdicts',
      points: [
        'The charge: no method, no settled answers, no facts',
        'The defence: progress is clarifying, not closing',
        'Only science counts is not itself a scientific claim',
        'Metaphysics examines what other fields assume',
      ],
      closing: 'You set out asking why anything exists. The real prize was learning to ask the question well.',
    },
    dur: 5.0,
  },
];
