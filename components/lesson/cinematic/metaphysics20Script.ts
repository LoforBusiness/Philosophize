import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-20, "Is This Real? (And What Would That Mean?)"
// Theme: ONE REAL WORLD, A THOUSAND RUNNING INSIDE IT, AND A TOKEN DROPPED BLIND.
//
// The simulation argument is a COUNTING argument, and almost every telling of it
// loses that and becomes a mood. So the stage is a tally: one outer frame, a
// grid of little frames multiplying inside it, and a running count at the foot.
// Nothing spooky happens. The number on the right gets large.
//
// The reader's own token is then dropped without being aimed, which is the
// step the argument actually turns on — not "could this be fake" but "of all
// the minds there are, which kind is yours likely to be".
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — two frames, the outer and the inner, and the
//     reader puts their token in one. The wrong answer is the one everybody
//     feels is obviously right, which is what makes the count worth drawing.
//   · beat 7  two CARDS — where the argument can actually be resisted, which is
//     not by insisting the world feels real (H66).
// ─────────────────────────────────────────────────────────────────────────────

export interface Met20Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The outer frame — base reality — 0…1. */ outer?: number;
  /** How much of the inner grid is running, 0…1. */ nest?: number;
  /** The running count at the foot, 0…1. */ tally?: number;
  /** The reader's token, dropped, 0…1. */ token?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Met20Beat[] = [
  {
    p: 172, x: 200, outer: 1,
    text: 'Begin with a single world, which is real. The simulation argument doesn’t deny that this world exists.',
    dur: 4.0,
  },
  {
    p: 2, x: 200, outer: 1, nest: 0.3, tally: 1,
    text: 'Nick Bostrom asks you to suppose that a civilisation like ours learns to run a world on a computer.',
    dur: 3.9,
  },
  {
    p: 266, x: 200, outer: 1, nest: 0.3, tally: 1,
    text: 'Such an advanced civilisation might run many thousands of simulations of its own past history.',
    dur: 1.8,
  },
  {
    p: 379, x: 132, outer: 1, nest: 1, tally: 1,
    text: 'Simulated minds would then vastly outnumber unsimulated ones. Yet each simulated mind would take its world to be real.',
    cite: 'Bostrom, 2003',
    dur: 4.8,
  },
  {
    p: 13, x: 132, outer: 1, nest: 1, tally: 1, token: 1,
    text: 'Suppose nothing you know tells you whether your own mind is simulated.',
    dur: 1.9,
  },
  {
    p: 266, x: 132, outer: 1, nest: 1, tally: 1, token: 1,
    text: 'By Bostrom’s principle of indifference, your mind is then most likely a simulated one.',
    dur: 1.9,
  },
  {
    p: 165, x: 132, outer: 1, nest: 1, tally: 1, token: 1, live: 1,
    interact: {
      prompt: 'Given that count, which frame is your own mind most likely inside?',
      explain: 'The inner grid, if the count is right. The argument concerns proportions, not whether the world feels fake. A mind chosen at random from that population is almost certainly a simulated one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 268, outer: 1, nest: 1, tally: 1, token: 1,
    quote: {
      id: 'lq-metaphysics-being-20-1',
      text: 'At least one of the following propositions is true: the human species is very likely to go extinct before reaching a posthuman stage; any posthuman civilisation is extremely unlikely to run simulations of its evolutionary history; we are almost certainly living in a computer simulation.',
      author: 'Nick Bostrom',
      work: 'Are You Living in a Computer Simulation?',
      era: '2003',
      branchSlugs: ['metaphysics'],
    },
    dur: 4.2,
  },
  {
    p: 176, x: 268, outer: 1, nest: 0.3, tally: 1, token: 1,
    text: 'Two of the three possibilities imply that few such simulations are ever run. Civilisations may die out first, or may choose not to run them.',
    dur: 3.5,
  },
  {
    p: 176, x: 268, outer: 1, nest: 0.3, tally: 1, token: 1,
    text: 'In either case, the number of simulated minds falls.',
    dur: 1.8,
  },
  {
    p: 383, x: 268, outer: 1, nest: 0.3, tally: 1, token: 1,
    interact: {
      prompt: 'For which count of simulations is your mind probably not simulated?',
      drag: {
        lo: 'NONE ARE EVER BUILT',
        hi: 'BILLIONS OF THEM RUN',
        start: 1,
        zones: [
          { id: 'none', upto: 0.3, reads: 'too few to outnumber the real minds', correct: true },
          { id: 'few', upto: 0.72, reads: 'enough to outnumber the real minds' },
          { id: 'many', upto: 1, reads: 'billions, so you are almost certainly simulated' },
        ],
      },
      explain: 'Too few to outnumber the real minds. The argument depends on the proportion. If simulated minds are a minority, a randomly chosen mind is probably real. How real the world feels is no evidence, since a simulated world would feel the same.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'A Question About Proportions',
      points: [
        'The argument counts minds rather than inspecting the world',
        'If simulated minds vastly outnumber real ones, most minds are simulated',
        'Bostrom argues that at least one of three possibilities holds',
        'The argument is resisted by denying the count, not by intuition',
      ],
      closing: 'Bostrom’s argument doesn’t say which of the three possibilities is true.',
    },
    dur: 3.4,
  },
];
