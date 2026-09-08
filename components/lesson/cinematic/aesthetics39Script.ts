import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-39, "Made Well, Or Made to Say Something?"
// Theme: THREE ROUTES FROM A PLAN TO A THING, AND ONE OF THEM WANDERS.
//
// The claim is about MAKING rather than about objects, so the scene refuses to
// draw the objects and draws the routes instead. Each column is a plan at the
// top, a run of steps, and the thing that came out. Two of the runs are straight
// because the maker was closing a gap. One has an empty dashed plan and a run
// that wanders, because there was no gap to close.
//
// That is the whole theory, and it is also why a reader can answer the first
// question without being told anything: the picture already distinguishes the
// three makers, and nothing in it is about wood.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — three columns, and the reader taps the maker who did
//     not know what the thing would be. On the stage because it is a comparison of
//     three shapes, which is exactly what a stage is for.
//   · beat 7  a SORT — where a church belongs. A fourth column arrives with the
//     question, and its route is drawn by the reader's own chip: straight for
//     craft, wandering for art, half and half for both.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics39Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the three columns, their names and their plans stand. */ routes?: number;
  /** How far each run has been walked, 0…1. */ steps?: number;
  /** 1 = the things that came out are on the bottom rail. */ works?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aesthetics39Beat[] = [
  {
    p: 25, x: 52, routes: 1,
    text: 'A chair and a sculpture can be the same wood, the same hands and the same skill.',
    dur: 3.8,
  },
  {
    p: 30, x: 52, routes: 1, steps: 1,
    text: 'So look at the making instead. Each of these is a plan at the top and the hours it took underneath.',
    dur: 4.4,
  },
  {
    p: 36, x: 52, routes: 1, steps: 1, works: 1,
    text: 'And here is what came out of each one.',
    dur: 2.6,
  },
  {
    p: 160, x: 52, routes: 1, steps: 1, works: 1, live: 1,
    interact: {
      prompt: 'Tap the maker who did not know what it would be.',
      explain: 'The middle one, and the picture says so twice over: an empty plan, and a run that wanders. The other two spent every hour closing a gap drawn before they began. Closing a drawn gap is what craft is.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 52, routes: 1, steps: 1, works: 1,
    text: 'That is the craft theory of art. The line is drawn in the making, and never in the thing that comes out.',
    dur: 4.6,
  },
  {
    p: 383, x: 98, routes: 1, steps: 1, works: 1,
    text: 'Immanuel Kant had drawn it two centuries earlier, and put the difference in one word: freedom.',
    dur: 4.2,
  },
  {
    p: 433, x: 98, routes: 1, steps: 1, works: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-39-1',
      text: 'Art is distinguished from handicraft: the first is called free, the second may be called mercenary.',
      author: 'Immanuel Kant',
      philosopherId: 'immanuel-kant',
      work: 'Critique of Judgement',
      era: '1790',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.4,
  },
  {
    p: 21, x: 98, routes: 1, steps: 1, works: 1,
    interact: {
      prompt: 'Where does a church belong?',
      sort: {
        chip: 'a church',
        bins: [
          { id: 'craft', label: 'craft', reads: 'a plan, and centuries of closing the gap' },
          { id: 'art', label: 'art', reads: 'found in the building, with no plan to close' },
          { id: 'both', label: 'both', reads: 'planned, and then found by the people who built it', correct: true },
        ],
      },
      explain: 'Both, and the fourth route says why. There was a drawing, and there were three hundred years of masons who never met the man who drew it. Most real making is like this, which is not a failure of the distinction but a reason to ask about particular things.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Routes',
      points: [
        'Craft closes a gap between a plan and a thing',
        'Art is said to have no gap to close',
        'The difference is in the making, not the object',
        'Commissioned masterpieces are the standing objection',
      ],
      closing: 'Most real making is a bit of both, and that is not a failure of the distinction. It is what makes asking about a particular thing worth doing.',
    },
    dur: 3.4,
  },
];
