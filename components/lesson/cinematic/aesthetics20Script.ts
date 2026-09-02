import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-20, "So Why Does Art Matter?"
// Theme: EVERY JOB ART IS GIVEN, AND A CHEAPER THING THAT ALREADY DOES IT.
//
// "Art matters" is the kind of claim a lesson can spend eight beats agreeing
// with and teach nothing. So this one runs an elimination instead: four reasons
// people actually give, each met by a substitute that does the same job better
// or cheaper, and struck out when the substitute lands.
//
// Three go. The fourth has no substitute arrive beside it, and the empty right
// half of that row is the answer — the reader sees the argument fail to be made
// rather than being told it cannot be.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — four rows, tap the one nothing replaced. Every
//     decoy is a reason somebody sincerely gives for art, which is why watching
//     each one get undercut is worth the beats (H66).
//   · beat 7  two CARDS — whether being replaceable would have settled anything,
//     because the elimination is a strong move and it is not a proof.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes20Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many claimed jobs are written, 0…1. */ uses?: number;
  /** How many substitutes have arrived beside them, 0…1. */ swaps?: number;
  /** How many rows have been struck through, 0…1. */ struck?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aes20Beat[] = [
  {
    p: 25, x: 200, uses: 1,
    text: 'Four reasons people give for why art is worth the money and the museums.',
    dur: 3.8,
  },
  {
    // 0.34, NOT 0.5. Three rows take a substitute, so 0.5 is one and a HALF of
    // them — and half a row is a half-drawn A CAMERA at 2:1, which is the blank box
    // the reader complained about (D35). It was also half an argument: this
    // sentence names one substitution, the textbook, and the picture should show
    // exactly that (A1).
    p: 45, x: 200, uses: 1, swaps: 0.34, struck: 0.34,
    text: 'Art teaches you things. So does a textbook, faster and with fewer mistakes.',
    cite: 'Instruction',
    dur: 4.2,
  },
  {
    p: 2, x: 132, uses: 1, swaps: 1, struck: 1,
    text: 'Art records how the world looked. A camera does the same.',
    dur: 2.5,
  },
  {
    p: 2, x: 132, uses: 1, swaps: 1, struck: 1,
    text: 'Art decorates a room, and wallpaper is cheaper.',
    dur: 1.9,
  },
  {
    p: 13, x: 132, uses: 1, swaps: 1, struck: 1,
    text: 'Three struck out, and nothing came for the fourth.',
    cite: 'The one left',
    dur: 3.2,
  },
  {
    p: 4, x: 132, uses: 1, swaps: 1, struck: 1, live: 1,
    interact: {
      prompt: 'Tap the row nothing arrived to replace.',
      explain: 'Showing you a world through somebody else\'s eyes. Facts can be handed over, images can be copied, walls can be covered. What has no substitute is another person\'s way of seeing, because that is not information that could be sent by a cheaper route.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 268, uses: 1, swaps: 1, struck: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-20-2',
      text: 'Art is not a diversion or a side issue. It is the most educational of human activities and a place in which the nature of morality can be seen.',
      author: 'Iris Murdoch',
      work: 'The Sovereignty of Good',
      era: '1970',
      philosopherId: 'iris-murdoch',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.0,
  },
  {
    p: 21, x: 268, uses: 1, swaps: 1, struck: 1,
    text: 'One warning about the method. Something can be replaceable and still be worth having.',
    dur: 3.8,
  },
  {
    p: 41, x: 268, uses: 1, swaps: 1, struck: 1,
    interact: {
      prompt: 'Set the lever to what crossing three out has done.',
      lever: {
        start: 0,
        stops: [
          { id: 'proved', reads: 'the last one is proved' },
          { id: 'nothing', reads: 'nothing at all' },
          { id: 'narrow', reads: 'the field is narrower, and nothing is proved', correct: true },
        ],
      },
      explain: 'The far setting. Crossing answers out shows which reasons cannot be the whole story, and it never makes the survivor true. Art may well teach and decorate and record. The question was what art does that nothing cheaper already does.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What Nothing Else Does',
      points: [
        'Most reasons given for art name a job something cheaper also does',
        'Instruction, record and decoration all have substitutes',
        'A particular way of seeing does not',
        'Elimination narrows the answer; it does not prove one',
      ],
      closing: 'Three rows crossed out, and the fourth is still waiting for its replacement.',
    },
    dur: 3.4,
  },
];
