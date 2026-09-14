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
    text: 'A theory of well-being says what makes a life go well for the person living it. Candidates include pleasure, achievement, being loved, knowing the truth and doing things yourself.',
    dur: 4.4,
  },
  {
    p: 443, x: 200, wants: 1, machine: 1,
    text: 'Robert Nozick, in 1974, imagined an experience machine. It gives you any experience you want, and while plugged in you believe it’s real.',
    cite: 'The experience machine',
    dur: 4.6,
  },
  {
    p: 379, x: 132, wants: 1, machine: 1,
    text: 'Nozick asks whether you’d plug in for life. He expects most people to refuse, and asks what their refusal shows.',
    dur: 4.0,
  },
  {
    p: 457, x: 132, wants: 1, machine: 1, live: 1,
    interact: {
      prompt: 'Which of the five goods can the experience machine provide?',
      explain: 'Pleasure. The other four goods depend on how the world is, not on how your life feels. You must in fact achieve, be loved, know the truth and act. The machine alters nothing but your experience, so you’d only believe you possessed them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 467, x: 132, wants: 1, machine: 1, cable: 1,
    text: 'The machine is connected to one good only. It supplies pleasure, which is a matter of how your life feels from the inside.',
    dur: 3.1,
  },
  {
    p: 467, x: 132, wants: 1, machine: 1, cable: 1,
    text: 'The other four goods require facts about the world. The machine can supply only the experience of them.',
    dur: 1.8,
  },
  {
    p: 139, x: 268, wants: 1, machine: 1, cable: 1,
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
    text: 'Hedonism holds that pleasure is the only thing good in itself. If it were true, plugging in would be an easy choice, so refusing is evidence against hedonism.',
    cite: 'Against hedonism',
    dur: 4.6,
  },
  {
    p: 41, x: 268, wants: 1, machine: 1, cable: 1,
    interact: {
      prompt: 'Which profile shows what the experience machine gives you across the five goods?',
      plot: {
        axis: 'HOW MUCH',
        cols: ['PLEASURE', 'ACHIEVING', 'BEING LOVED', 'THE TRUTH', 'DOING IT'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'all', profile: [0.92, 0.9, 0.9, 0.9, 0.9], reads: 'all five, as good as the real thing' },
          { id: 'feel', profile: [0.94, 0.08, 0.08, 0.06, 0.05], reads: 'pleasure, and none of the other four', correct: true },
          { id: 'none', profile: [0.1, 0.1, 0.08, 0.08, 0.06], reads: 'none of the five' },
        ],
      },
      explain: 'Pleasure, and none of the other four. The machine supplies pleasure but can’t make you achieve, be loved, know or act. The profile high across all five treats the feeling of each good as worth as much as the good. That’s the hedonist view Nozick rejects.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What the Experience Machine Shows',
      points: [
        'The machine offers experiences, not the things experienced',
        'Most people refuse, which is evidence against pure hedonism',
        'Nozick: people also value acting, character and contact with reality',
        'A hedonist may blame the refusal on status quo bias',
      ],
      closing: 'If you’d refuse to plug in, you seem to value more than how your life feels.',
    },
    dur: 3.4,
  },
];
