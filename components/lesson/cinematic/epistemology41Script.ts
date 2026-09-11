import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-41, "The Oar That Looks Bent"
// Theme: ONE SHAFT, ONE WATERLINE, AND A KINK THAT IS NOT IN THE WOOD.
//
// The argument from illusion is short enough that a picture can hold all of it,
// so the scene draws exactly the thing under discussion and nothing else: a
// waterline, a shaft crossing it, and the angle it picks up on the way down.
//
// The three answers are stacked in a column down the right rather than in a row
// along the bottom (H60b). The oar is a TALL object and a row of plates under it
// would push the band past three hundred units to hold both; a column beside it
// keeps the composition upright, which is also what the subject is.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the claim a direct
//     realist refuses. On the stage because the kink is right there and the
//     question is what to say about it.
//   · beat 8  a POLL — what you are aware of, and who said so. Choosing the
//     sense-datum draws a second, dashed oar in front of the real one, which is
//     precisely what the theory adds to the world.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology41Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the water and its surface are drawn. */ water?: number;
  /** 1 = the oar is in the water and carries its kink. */ oar?: number;
  /** 1 = the submerged half has been straightened — the oar lifted clear. */ lifted?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epistemology41Beat[] = [
  {
    p: 423, x: 28, oar: 1, lifted: 1,
    text: 'Hold a straight oar up. Nothing to report.',
    dur: 3.4,
  },
  {
    p: 160, x: 28, water: 1, oar: 1,
    text: 'Put half the oar in water and the shaft kinks at the surface.',
    dur: 3.8,
  },
  {
    p: 434, x: 28, water: 1, oar: 1,
    text: 'The argument is three steps. What you see is bent, and the oar is not.',
    dur: 4.4,
  },
  {
    p: 258, x: 28, water: 1, oar: 1,
    text: 'So what you see is not the oar. Something else is standing in front of it.',
    dur: 4.6,
  },
  {
    p: 167, x: 28, water: 1, oar: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the claim a direct realist refuses.',
      explain: 'The bottom plate. Nobody disputes the look, and nobody disputes the oar. The argument would be pointless if either were in doubt. What gets refused is the slide from “something looks bent” to “a bent something is here”.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 449, x: 88, water: 1, oar: 1,
    text: 'Bertrand Russell accepted the conclusion and named the thing you see a sense-datum.',
    dur: 4.8,
  },
  {
    p: 430, x: 88, water: 1, oar: 1,
    quote: {
      id: 'lq-epistemology-knowledge-41-1',
      text: 'The real table, if there is one, is not immediately known to us at all, but must be an inference from what is immediately known.',
      author: 'Bertrand Russell',
      philosopherId: 'bertrand-russell',
      work: 'The Problems of Philosophy',
      era: '1912',
      branchSlugs: ['epistemology'],
    },
    dur: 4.8,
  },
  {
    p: 445, x: 88, water: 1, oar: 1,
    text: 'J. L. Austin answered that looking bent is one of the ways a straight oar looks.',
    dur: 4.6,
  },
  {
    p: 168, x: 88, water: 1, oar: 1,
    interact: {
      prompt: 'What are you aware of at the waterline?',
      poll: {
        options: [
          { id: 'oar', reads: 'the oar, which merely looks bent from here', holders: ['J. L. Austin'], correct: true },
          { id: 'datum', reads: 'a bent sense-datum standing in for it', holders: ['Bertrand Russell', 'A. J. Ayer'] },
          { id: 'mind', reads: 'a state of your own mind, and nothing outside', holders: ['George Berkeley'] },
        ],
      },
      explain: 'The oar. Things look different from different places. A kink at the waterline is one of the ways a straight oar looks. The sense-datum buys a tidy story at a high price. Once you only ever meet the stand-in, the oar itself becomes a guess.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 437, x: 88, water: 1, oar: 1,
    summary: {
      title: 'At the Waterline',
      points: [
        'The oar looks bent and is not bent',
        'The argument concludes you see something else',
        'Its weak step is the slide from looks to is',
        'Sense-data explain the look and lose the world',
      ],
      closing: 'Whichever way you go, notice how much theory hid inside what sounded like a plain description of a boat.',
    },
    dur: 4.6,
  },
];
