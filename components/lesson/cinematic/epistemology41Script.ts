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
    text: 'Consider a straight oar held up in the air. Here appearance and reality agree: it looks straight and is straight.',
    dur: 3.4,
  },
  {
    p: 160, x: 28, water: 1, oar: 1,
    text: 'Now put half of the oar in water. Because light refracts at the surface, the oar looks bent there.',
    dur: 3.8,
  },
  {
    p: 434, x: 28, water: 1, oar: 1,
    text: 'The argument from illusion takes three steps. The oar looks bent, but the oar itself is straight.',
    dur: 4.4,
  },
  {
    p: 258, x: 28, water: 1, oar: 1,
    text: 'Next, the argument infers that a bent thing is seen. The bent thing can’t be the straight oar, so you see something other than the oar.',
    dur: 4.6,
  },
  {
    p: 167, x: 28, water: 1, oar: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Which step does a direct realist, who holds that you see the oar itself, reject?',
      explain: 'A bent thing is seen. A direct realist accepts that the oar looks bent and that it’s straight. What gets rejected is the inference from “something looks bent” to “a bent thing is seen”. Without that step, nothing but the oar is seen.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 449, x: 88, water: 1, oar: 1,
    text: 'Bertrand Russell accepted the conclusion. He held that you directly see a sense-datum, a patch of colour and shape, and only infer the oar.',
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
    text: 'J. L. Austin rejected the inference. Looking bent in water, he argued, is one of the ways a straight oar looks.',
    dur: 4.6,
  },
  {
    p: 168, x: 88, water: 1, oar: 1,
    interact: {
      prompt: 'When the half-submerged oar looks bent, what are you directly aware of?',
      poll: {
        options: [
          { id: 'oar', reads: 'the oar, which merely looks bent from here', holders: ['J. L. Austin'], correct: true },
          { id: 'datum', reads: 'a bent sense-datum, not the oar itself', holders: ['Bertrand Russell', 'A.J. Ayer'] },
          { id: 'mind', reads: 'a bent idea, with no matter behind it', holders: ['George Berkeley'] },
        ],
      },
      explain: 'The oar, which merely looks bent from here. On Austin’s view, a straight oar in water looks bent, and nothing extra is seen. Sense-data explain the look, but then the oar becomes only an inference that could be mistaken.',
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
        'Its weak step infers a bent thing from a bent look',
        'Sense-data explain the look but make the oar an inference',
      ],
      closing: 'The argument from illusion shows that a plain description of what you see can carry a theory of perception.',
    },
    dur: 4.6,
  },
];
