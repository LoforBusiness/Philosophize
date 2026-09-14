import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-20, "Beat the Best Version, Not the Worst"
// Theme: THREE VERSIONS OF ONE CLAIM, AND HOW MANY LEGS EACH IS STANDING ON.
//
// A straw man is usually taught as dishonesty, which lets every reader off: they
// would never do that. It is much more often laziness, and the picture is built
// to show that instead — the three boards are the SAME claim, nobody has lied,
// and the only difference is how much support was left under each one when it was
// repeated.
//
// The struts are the whole drawing. A version standing on one leg falls over when
// anything touches it, and knocking it down tells you nothing about the version
// standing on five.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — three boards, tap the one a straw man goes for.
//     The reader identifies the move before it is named, which is the order that
//     makes a fallacy stick.
//   · beat 7  a LEVER — the arm swings between the three versions and the reader
//     throws it at the one they should be arguing with. A lever rather than cards
//     because this is a SETTING you adopt and then live with, not a fact to
//     recall, and the arm being heavy is the point.
// ─────────────────────────────────────────────────────────────────────────────

export interface Log20Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the three boards are up, 0…1. */ boards?: number;
  /** The supports drawn under each one, 0…1. */ struts?: number;
  /** The blow landing on the flimsy one, 0…1. */ strike?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Log20Beat[] = [
  {
    p: 462, x: 200, boards: 1,
    text: 'Consider three reports of the claim “screens are making us worse at paying attention”. None of them is a lie, and none adds anything false.',
    dur: 4.0,
  },
  {
    p: 2, x: 200, boards: 1, struts: 1,
    text: 'The reports differ only in how many of the supporting reasons they repeat. One repeats all of them.',
    cite: 'Same claim, different support',
    dur: 2.6,
  },
  {
    p: 2, x: 200, boards: 1, struts: 1,
    text: 'A second repeats some of them. The third repeats a single reason.',
    dur: 2.2,
  },
  {
    p: 447, x: 132, boards: 1, struts: 1,
    text: 'A straw man is not usually a lie. It’s an objection to the weakest version of a view, presented as an objection to the view itself.',
    dur: 4.6,
  },
  {
    p: 457, x: 132, boards: 1, struts: 1, live: 1,
    interact: {
      prompt: 'Which of the three versions does a straw man attack?',
      explain: 'The version with a single reason. Refuting so weak a version takes little effort, so it tempts, but the victory settles nothing. The two better-supported versions still stand, and neither has been answered.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, boards: 1, struts: 1, strike: 1,
    text: 'The weakest version falls, but the stronger versions remain. So the claim itself is still unrefuted.',
    cite: 'The claim still stands',
    dur: 4.0,
  },
  {
    p: 414, x: 268, boards: 1, struts: 1, strike: 1,
    text: 'The remedy is called steelmanning. It means building the strongest form of the other side’s view and answering that form instead.',
    cite: 'Steelmanning',
    dur: 4.4,
  },
  {
    p: 144, x: 268, boards: 1, struts: 1, strike: 1,
    quote: {
      id: 'lq-logic-arguments-20-1',
      text: 'He who knows only his own side of the case knows little of that. His reasons may be good, and no one may have been able to refute them.',
      author: 'John Stuart Mill',
      work: 'On Liberty',
      era: '1859',
      philosopherId: 'john-stuart-mill',
      branchSlugs: ['logic'],
    },
    dur: 4.0,
  },
  {
    p: 41, x: 268, boards: 1, struts: 1, strike: 1,
    interact: {
      prompt: 'What does steelmanning require you to answer?',
      sort: {
        chip: 'steelmanning',
        bins: [
          { id: 'weak', label: 'the weakest version', reads: 'the weakest version of the view you heard' },
          { id: 'said', label: 'their exact words', reads: 'the literal words the other side used' },
          { id: 'strong', label: 'the best argument', reads: 'the best argument that could be made for it', correct: true },
        ],
      },
      explain: 'Steelmanning answers the best argument. Answering their exact words is fair, but a poorly stated case can be repaired, and the repair is what matters. Once the strongest version is answered, the other side has no better defence left.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Straw Man and the Steelman',
      points: [
        'A straw man attacks a weakened version of the claim',
        'It usually comes from carelessness rather than dishonesty',
        'Refuting it leaves the stronger versions unanswered',
        'Steelmanning answers the strongest version available',
      ],
      closing: 'Before objecting to a view, state the view as well as its best defender would.',
    },
    dur: 3.4,
  },
];
