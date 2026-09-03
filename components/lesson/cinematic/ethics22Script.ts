import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-22, "Would You Plug In Forever?"
// Theme: FIVE THINGS PEOPLE WANT, AND ONE COLUMN THE MACHINE CAN FILL.
//
// Nozick's machine is an intuition pump and it only works if the reader answers
// honestly before the point is made. So the stage sets out five things people
// say they want, side by side and unranked, and the machine's output is not shown
// until the reader has drawn what they think it gives.
//
// The trap in most tellings is to treat the answer as obvious. It is not: a
// hedonist who says the machine gives you everything is being consistent, and the
// lesson has to let that reading be drawable or it is not asking anything.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — five columns, tap the one the machine really can
//     deliver. Every other column is something people plainly want, so the decoys
//     are the whole of the rest of a life (H66).
//   · beat 7  a PLOT — the reader draws the machine's output across all five with
//     one finger. Three shapes are recognised and one of them is the hedonist's,
//     because a question whose wrong answers are silly teaches nothing.
// ─────────────────────────────────────────────────────────────────────────────

export interface Eth22Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The five wants, as columns, 0…1. */ wants?: number;
  /** The machine drawn behind them, 0…1. */ machine?: number;
  /** The cable from the machine into the first column only, 0…1. */ cable?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Eth22Beat[] = [
  {
    p: 25, x: 200, wants: 1,
    text: 'Five things people say they want out of a life. Nobody has ranked them and nothing here is a trick.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, wants: 1, machine: 1,
    text: 'Now the offer. A tank, a lifetime of experience indistinguishable from the real thing, and no way back.',
    cite: 'The experience machine',
    dur: 4.6,
  },
  {
    p: 379, x: 132, wants: 1, machine: 1,
    text: 'Almost everybody says no, and most cannot say why. The picture is where the reason is.',
    dur: 4.0,
  },
  {
    p: 4, x: 132, wants: 1, machine: 1, live: 1,
    interact: {
      prompt: 'Tap the one thing the machine can actually deliver.',
      explain: 'The feeling. Everything else on that row is something you wanted to BE true, not something you wanted to feel — and the tank changes what you experience without touching any of it. You would believe you had them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 132, wants: 1, machine: 1, cable: 1,
    text: 'One cable, into one column. The other four are not switched off.',
    dur: 3.1,
  },
  {
    p: 176, x: 132, wants: 1, machine: 1, cable: 1,
    text: 'They were never plugged in.',
    dur: 1.8,
  },
  {
    p: 137, x: 268, wants: 1, machine: 1, cable: 1,
    quote: {
      id: 'lq-ethics-ethics-22-2',
      text: 'We want to do certain things, and not just have the experience of doing them.',
      author: 'Robert Nozick',
      work: 'Anarchy, State, and Utopia',
      era: '1974',
      philosopherId: 'robert-nozick',
      branchSlugs: ['ethics'],
    },
    dur: 3.6,
  },
  {
    p: 407, x: 268, wants: 1, machine: 1, cable: 1,
    text: 'That refusal is evidence about you. If pleasure were all that mattered, the tank would be an easy yes.',
    cite: 'Against hedonism',
    dur: 4.6,
  },
  {
    p: 41, x: 268, wants: 1, machine: 1, cable: 1,
    interact: {
      prompt: 'Draw what the machine gives you across the five.',
      plot: {
        axis: 'HOW MUCH',
        cols: ['PLEASURE', 'ACHIEVING', 'BEING LOVED', 'THE TRUTH', 'DOING IT'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'all', profile: [0.92, 0.9, 0.9, 0.9, 0.9], reads: 'everything you asked for' },
          { id: 'feel', profile: [0.94, 0.08, 0.08, 0.06, 0.05], reads: 'all the feeling, none of the doing', correct: true },
          { id: 'none', profile: [0.1, 0.1, 0.08, 0.08, 0.06], reads: 'nothing at all' },
        ],
      },
      explain: 'High on the left and flat on the floor after it. The tank is very good at one column and cannot reach the others. Drawing it high all the way across is the hedonist answer, which is the position Nozick is arguing against.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Feeling And The Thing',
      points: [
        'The machine offers experiences, not the things experienced',
        'Most people refuse, which is evidence against pure hedonism',
        'We want to do things, be a certain way, and be in contact with reality',
        'A defender can say the refusal is just fear of the unfamiliar',
      ],
      closing: 'One cable, one column. Ask yourself which of the other four you were prepared to lose.',
    },
    dur: 3.4,
  },
];
