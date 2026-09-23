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
  /** 1 = a heraldic mark flashes on the line — citizenship named as an inherited rank (group AH). */ crest?: number;
  /** 1 = a small disc flashes at the line's centre — "at the core of" self-determination (group AH). */ core?: number;
};

export const BEATS: Political29Beat[] = [
  {
    p: 330, x: 24, cribs: 1, decide: 0.5,
    text: 'Your place of birth may be the most consequential piece of luck in your life.',
    dur: 4.6,
  },
  {
    p: 180, x: 24, cribs: 1, wall: 1, decide: 0.5,
    text: 'Suppose two babies are born on the same day, one in a wealthy democracy and one just across its border.',
    dur: 5.0,
  },
  {
    p: 444, x: 24, cribs: 1, wall: 1, decide: 0.9,
    text: 'Neither baby earned its side of the border. Joseph Carens calls citizenship the modern equivalent of feudal privilege.',
    dur: 5.0,
  },
  {
    p: 259, x: 24, cribs: 1, wall: 1, decide: 0.9, crest: 1,
    text: 'Like feudal rank, citizenship is an inherited status that shapes a life. Liberal states reject inherited rank among citizens.',
    dur: 5.0,
  },
  {
    p: 160, x: 24, cribs: 1, wall: 1, decide: 0.9, plates: 1, live: 1,
    interact: {
      prompt: 'What does comparing citizenship to feudal privilege show, on Carens’s view?',
      explain: 'Birth decides too much. Liberal states already reject inherited rank within their borders. Carens asks why birth should settle so much at the border. He doesn’t claim that citizens are nobles or that feudalism is back.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 461, x: 80, cribs: 1, wall: 1, decide: 0.9,
    text: 'Michael Walzer defends the opposite view. A community is partly defined by its power to admit or refuse newcomers.',
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
    p: 457, x: 80, cribs: 1, wall: 1, decide: 0.9, core: 1,
    text: 'For Walzer, admission and exclusion are at the core of self-determination. Without them, no community could keep its character.',
    dur: 4.8,
  },
  {
    p: 171, x: 80, cribs: 1, wall: 1,
    interact: {
      prompt: 'As you cross the border, which shape does a life take?',
      plot: {
        cols: ['ONE SIDE', 'THE LINE', 'THE OTHER'],
        axis: 'SETTLED AT BIRTH',
        start: [0.5, 0.5, 0.5],
        shapes: [
          { id: 'most', profile: [0.9, 0.88, 0.5, 0.15, 0.12], reads: 'most of it changes at the line', correct: true },
          { id: 'same', profile: [0.55, 0.55, 0.55, 0.55, 0.55], reads: 'the two lives come out much alike' },
          { id: 'small', profile: [0.62, 0.6, 0.55, 0.5, 0.48], reads: 'a small nudge, then their own choices' },
        ],
      },
      explain: 'Most of it changes at the line. Schooling, safety, healthcare and expected income shift sharply across a border that neither child chose, and none of it answers to anything either of them has done. That\'s why the place of birth is called a lottery.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 308, x: 80, cribs: 1, wall: 1, decide: 0.9,
    summary: {
      title: 'Borders and the Birth Lottery',
      points: [
        'Carens: citizenship is a form of inherited privilege',
        'Walzer: a community must decide who joins it',
        'The birth lottery shapes a life more than most choices',
        'Both sides argue in the language of justice',
      ],
      closing: 'The debate turns on whether a community’s right to control membership outweighs the unfairness of the birth lottery.',
    },
    dur: 5.0,
  },
];
