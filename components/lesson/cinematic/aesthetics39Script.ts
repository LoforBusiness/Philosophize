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
    text: 'A chair and a sculpture can be made from the same wood, by the same hands, with the same skill. So materials and skill can’t separate art from craft.',
    dur: 3.8,
  },
  {
    p: 30, x: 52, routes: 1, steps: 1,
    text: 'The difference, then, must lie in the making. Each route runs from a plan at the top, through the hours of work beneath it.',
    dur: 4.4,
  },
  {
    p: 36, x: 52, routes: 1, steps: 1, works: 1,
    text: 'Each route ends in a finished work: a chair, a poem and a copy.',
    dur: 2.6,
  },
  {
    p: 160, x: 52, routes: 1, steps: 1, works: 1, live: 1,
    interact: {
      prompt: 'Which maker didn’t know in advance what the finished work would be?',
      explain: 'The poet. The poem’s plan is empty, and its route wanders. The other two makers worked towards a result fixed before they began. On this view, working to a fixed result is what makes something craft.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 52, routes: 1, steps: 1, works: 1,
    text: 'R. G. Collingwood draws his line between art and craft in the process of making, not in the finished object.',
    dur: 4.6,
  },
  {
    p: 383, x: 98, routes: 1, steps: 1, works: 1,
    text: 'Immanuel Kant drew a related line in 1790. He placed the difference between art and handicraft in freedom.',
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
      prompt: 'Where does a church belong on Collingwood’s distinction?',
      sort: {
        chip: 'a church',
        bins: [
          { id: 'craft', label: 'craft', reads: 'a fixed plan, carried out over centuries' },
          { id: 'art', label: 'art', reads: 'discovered in the building, with no plan' },
          { id: 'both', label: 'both', reads: 'planned, then partly discovered by its builders', correct: true },
        ],
      },
      explain: 'Both craft and art. A medieval church followed a plan, yet masons over generations changed it as they built. Most real making combines the two. The distinction survives, but each case must be examined.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Collingwood on Art and Craft',
      points: [
        'Craft carries out a plan fixed in advance',
        'On Collingwood’s view, art has no plan to execute',
        'The difference is in the making, not the object',
        'Commissioned masterpieces are an objection to the theory',
      ],
      closing: 'Most real making combines craft and art. The distinction is useful because it asks how a particular thing was made.',
    },
    dur: 3.4,
  },
];
