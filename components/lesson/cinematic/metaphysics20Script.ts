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
    p: 25, x: 200, outer: 1,
    text: 'One world, and the world is real. Nothing here denies the world exists.',
    dur: 4.0,
  },
  {
    p: 2, x: 200, outer: 1, nest: 0.3, tally: 1,
    text: 'Now suppose a civilisation like ours learns to run a world on a computer. Not one.',
    dur: 3.9,
  },
  {
    p: 2, x: 200, outer: 1, nest: 0.3, tally: 1,
    text: 'Thousands, for research.',
    dur: 1.8,
  },
  {
    p: 45, x: 132, outer: 1, nest: 1, tally: 1,
    text: 'Count the minds. Almost all the minds now sit inside a machine, and every mind believes otherwise.',
    cite: 'Bostrom, 2003',
    dur: 4.8,
  },
  {
    p: 13, x: 132, outer: 1, nest: 1, tally: 1, token: 1,
    text: 'Here is your token. Nobody aimed the token.',
    dur: 1.9,
  },
  {
    p: 13, x: 132, outer: 1, nest: 1, tally: 1, token: 1,
    text: 'It landed where most of the minds are.',
    dur: 1.9,
  },
  {
    p: 4, x: 132, outer: 1, nest: 1, tally: 1, token: 1, live: 1,
    interact: {
      prompt: 'Tap the frame your token is most likely inside.',
      explain: 'The inner grid, if the count is right, and that is the whole argument. It is not a claim that the world feels fake. It is a claim about proportions: pick a mind at random from that picture and you will almost certainly pick a simulated one.',
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
    p: 21, x: 268, outer: 1, nest: 0.3, tally: 1, token: 1,
    text: 'Two of those three say the grid never gets built. Extinction, or nobody bothering.',
    dur: 3.5,
  },
  {
    p: 21, x: 268, outer: 1, nest: 0.3, tally: 1, token: 1,
    text: 'Watch it shrink.',
    dur: 1.8,
  },
  {
    p: 41, x: 268, outer: 1, nest: 0.3, tally: 1, token: 1,
    interact: {
      prompt: 'Drag to the count that stops this argument.',
      drag: {
        lo: 'NONE ARE EVER BUILT',
        hi: 'BILLIONS OF THEM RUN',
        start: 1,
        zones: [
          { id: 'none', upto: 0.3, reads: 'none at all, so nothing follows', correct: true },
          { id: 'few', upto: 0.72, reads: 'a handful, still far fewer than the real one' },
          { id: 'many', upto: 1, reads: 'billions, and you are almost certainly inside one' },
        ],
      },
      explain: 'Attack the count. If nobody ever runs those worlds, or nobody lasts long enough to, the proportion never appears and the conclusion does not follow. How real it all feels is no help at all: a simulated morning would feel exactly like this one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'A Question About Proportions',
      points: [
        'The argument counts minds, it does not inspect the world',
        'If simulated minds vastly outnumber real ones, most minds are simulated',
        'Bostrom offers three possibilities and only one is the headline',
        'It is resisted by denying the count, not by feeling certain',
      ],
      closing: 'Nothing here says the world is fake. It says a census would be embarrassing.',
    },
    dur: 3.4,
  },
];
