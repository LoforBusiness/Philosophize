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
    p: 379, x: 200, uses: 1,
    text: 'Consider four common reasons for valuing art. For each, ask whether something cheaper does the same job.',
    dur: 3.8,
  },
  {
    // 0.34, NOT 0.5. Three rows take a substitute, so 0.5 is one and a HALF of
    // them — and half a row is a half-drawn A CAMERA at 2:1, which is the blank box
    // the reader complained about (D35). It was also half an argument: this
    // sentence names one substitution, the textbook, and the picture should show
    // exactly that (A1).
    p: 398, x: 200, uses: 1, swaps: 0.34, struck: 0.34,
    text: 'First, art can teach. A textbook also teaches, often more quickly and with fewer mistakes.',
    cite: 'Instruction',
    dur: 4.2,
  },
  {
    p: 2, x: 132, uses: 1, swaps: 1, struck: 1,
    text: 'Second, art records how the world looked. A camera records appearances at least as faithfully.',
    dur: 2.5,
  },
  {
    p: 2, x: 132, uses: 1, swaps: 1, struck: 1,
    text: 'Third, wallpaper decorates a room more cheaply than art does.',
    dur: 1.9,
  },
  {
    p: 383, x: 132, uses: 1, swaps: 1, struck: 1,
    text: 'Each of the first three reasons has a cheaper substitute. No substitute has been found for the fourth.',
    cite: 'The remaining reason',
    dur: 3.2,
  },
  {
    p: 461, x: 132, uses: 1, swaps: 1, struck: 1, live: 1,
    interact: {
      prompt: 'Which reason for valuing art has no cheaper substitute?',
      explain: 'Showing you the world through someone’s eyes. A textbook can teach facts, a camera can record how things look, and wallpaper can cover walls. No cheaper thing can pass on another person’s way of seeing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 144, x: 268, uses: 1, swaps: 1, struck: 1,
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
    p: 380, x: 268, uses: 1, swaps: 1, struck: 1,
    text: 'This method of elimination has a limit. Something can be replaceable and still be worth having.',
    dur: 3.8,
  },
  {
    p: 442, x: 268, uses: 1, swaps: 1, struck: 1,
    interact: {
      prompt: 'What does eliminating three of the four reasons establish?',
      sort: {
        chip: 'eliminating three reasons',
        bins: [
          { id: 'proved', label: 'proves the last', reads: 'the remaining reason is proved' },
          { id: 'nothing', label: 'changes nothing', reads: 'nothing about the remaining reason' },
          { id: 'narrow', label: 'narrows the field', reads: 'the field narrows, and nothing is proved', correct: true },
        ],
      },
      explain: 'Elimination narrows the field. Removing three reasons shows they can’t fully explain art’s value, but it doesn’t prove the fourth. Art may still teach, record and decorate. The question was what art does that nothing cheaper does.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What Art Alone Provides',
      points: [
        'Most reasons given for art name a job something cheaper also does',
        'Instruction, record and decoration all have substitutes',
        'A particular way of seeing does not',
        'Elimination narrows the answer but proves none',
      ],
      closing: 'The fourth reason survives elimination, though surviving isn’t the same as being proved.',
    },
    dur: 3.4,
  },
];
