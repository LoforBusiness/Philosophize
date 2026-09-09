import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-29, "May A State Close Its Doors?"
// Theme: TWO CRIBS EITHER SIDE OF A LINE, AND HOW MUCH THE LINE DECIDES.
//
// Both sides of this argument agree about the facts and disagree about what they
// weigh, so the stage draws the fact and nothing else: two newborns, one line,
// and two columns showing what each of them can expect.
//
// The cribs are identical and stay identical. Neither child did anything, which
// is the only premise the case needs, and a picture that made one of them look
// more deserving would have answered the question before it was asked.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the point Carens
//     is making. On the stage because the two cribs are already the comparison
//     the argument turns on.
//   · beat 8  a DRAG — how much the line decides. The two columns part as the
//     knob travels, so a reader who says the border settles nothing watches the
//     two lives come out level and can check that against the world.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political29Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two cribs and their names are drawn. */ cribs?: number;
  /** 1 = the line between them is drawn. */ wall?: number;
  /** How much the line decides about the two lives, 0…1. */ decide?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Political29Beat[] = [
  {
    p: 330, x: 24, cribs: 1, decide: 0.5,
    text: 'The luckiest thing that ever happened to you may be where you were born.',
    dur: 4.6,
  },
  {
    p: 180, x: 24, cribs: 1, wall: 1, decide: 0.5,
    text: 'Two babies are born the same day. One inside a wealthy democracy, one just across the line.',
    dur: 5.0,
  },
  {
    p: 444, x: 24, cribs: 1, wall: 1, decide: 0.9,
    text: 'Neither did anything to deserve a side. Carens calls citizenship the modern form of feudal privilege.',
    dur: 5.0,
  },
  {
    p: 259, x: 24, cribs: 1, wall: 1, decide: 0.9,
    text: 'An inherited status that shapes a life, handed out by birth. Liberal states reject that kind of rank at home.',
    dur: 5.0,
  },
  {
    p: 160, x: 24, cribs: 1, wall: 1, decide: 0.9, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the point Carens is making with feudal privilege.',
      explain: 'Birth decides too much. A liberal state already refuses inherited rank at home. Carens asks why a lottery at the border should be any different. The comparison is an argument, not a claim about literal nobles.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 461, x: 80, cribs: 1, wall: 1, decide: 0.9,
    text: 'Walzer answers back. A community is partly defined by the power to admit or refuse.',
    dur: 4.6,
  },
  {
    p: 442, x: 80, cribs: 1, wall: 1, decide: 0.9,
    quote: {
      id: 'lq-political-political-29-1',
      text: 'Citizenship in Western liberal democracies is the modern equivalent of feudal privilege, an inherited status that greatly enhances one\'s life chances.',
      author: 'Joseph Carens',
      work: 'Aliens and Citizens',
      era: '1987',
      branchSlugs: ['political-philosophy'],
    },
    dur: 5.0,
  },
  {
    p: 457, x: 80, cribs: 1, wall: 1, decide: 0.9,
    text: 'Without control over membership, a self-governing people stops meaning anything at all.',
    dur: 4.8,
  },
  {
    p: 171, x: 80, cribs: 1, wall: 1,
    interact: {
      prompt: 'How much does the line decide about the two lives?',
      drag: {
        lo: 'NOTHING',
        hi: 'ALMOST EVERYTHING',
        start: 0.05,
        zones: [
          { id: 'none', upto: 0.3, reads: 'the two will end up much the same' },
          { id: 'some', upto: 0.65, reads: 'a nudge, and then their own choices' },
          { id: 'most', upto: 1, reads: 'schooling, safety and money, settled at birth', correct: true },
        ],
      },
      explain: 'Almost everything. Neither baby chose a side, and the line shapes both lives more than anything they go on to do. Carens builds the open-borders case on that, and Walzer still answers that a community decides who joins.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 308, x: 80, cribs: 1, wall: 1, decide: 0.9,
    summary: {
      title: 'The Door and the Lottery',
      points: [
        'Carens: citizenship is inherited privilege by another name',
        'Walzer: a community must decide who joins it',
        'The birth lottery shapes a life more than most choices',
        'Both sides argue in the language of justice',
      ],
      closing: 'Nobody chose where to be born, and the choice nobody made decides more than almost anything else.',
    },
    dur: 5.0,
  },
];
