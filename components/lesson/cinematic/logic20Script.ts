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
    p: 25, x: 200, boards: 1,
    text: 'Three versions of the same claim. Nobody has lied and nobody has invented anything.',
    dur: 4.0,
  },
  {
    p: 2, x: 200, boards: 1, struts: 1,
    text: 'What differs is the support underneath. One version kept all of it.',
    cite: 'Same claim, three states',
    dur: 2.6,
  },
  {
    p: 2, x: 200, boards: 1, struts: 1,
    text: 'One kept some. One is standing on a single leg.',
    dur: 2.2,
  },
  {
    p: 45, x: 132, boards: 1, struts: 1,
    text: 'A straw man is not usually a lie. It is repeating the weakest version you heard and then arguing with that.',
    dur: 4.6,
  },
  {
    p: 4, x: 132, boards: 1, struts: 1, live: 1,
    interact: {
      prompt: 'Tap the version a straw man goes after.',
      explain: 'The board on a single leg. That board falls the moment anything touches it, which is why knocking it down is tempting and why the win settles nothing. The other two boards are still standing, and neither has been answered.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, boards: 1, struts: 1, strike: 1,
    text: 'Down it goes, and the argument you were actually in has not moved an inch.',
    cite: 'A win worth nothing',
    dur: 4.0,
  },
  {
    p: 13, x: 268, boards: 1, struts: 1, strike: 1,
    text: 'The repair has a name. Build the strongest version they could have meant, and take that one on instead.',
    cite: 'Steelmanning',
    dur: 4.4,
  },
  {
    p: 137, x: 268, boards: 1, struts: 1, strike: 1,
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
      prompt: 'Throw the lever to the version you should be arguing with.',
      lever: {
        start: 0,
        stops: [
          { id: 'weak', reads: 'you beat a view nobody holds' },
          { id: 'said', reads: 'you answer what they actually said' },
          { id: 'strong', reads: 'you take on the best case there is', correct: true },
        ],
      },
      explain: 'The strongest one. Answering what they said is honest and still not enough, because a poorly put case can be repaired and the repair is what you will meet next. Beat the best version and every weaker one falls with it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Which Version You Fight',
      points: [
        'A straw man attacks a weakened version of the claim',
        'It is usually laziness rather than dishonesty',
        'Beating it leaves the real argument untouched',
        'Steelmanning takes on the strongest version available',
      ],
      closing: 'If you cannot state the other side\'s case better than they did, you are not ready to answer it.',
    },
    dur: 3.4,
  },
];
