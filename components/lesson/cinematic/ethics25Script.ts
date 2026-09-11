import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-25, "For Your Own Good"
// Theme: AN UNSAFE BRIDGE, A SIGN, AND A GATE THE READER DECIDES TO BUILD.
//
// Mill's line is about WHOSE RISK IT IS, so the scene puts the risk on the stage
// and nobody else near it. A bridge with a plank missing, a sign that can be read,
// and a gate that can be shut. Those are the only three moves anyone has: warn,
// nudge, forbid — and the picture lets the reader make all three.
//
// The bridge is Mill's own example and it is the hard case for his own rule, so
// it earns the middle of the lesson rather than a footnote: grabbing a stranger
// is allowed there precisely because he does not yet know, which is not the same
// as deciding for him.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the only reason
//     Mill accepts for compelling a competent adult. On the stage because the
//     bridge above it is the tempting wrong answer, drawn.
//   · beat 9  a DRAG — how far the state may go. The gate across the bridge is
//     built by the reader's own thumb: nothing at the warning end, a full barrier
//     at the ban end.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics25Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the bridge, its piers and the missing plank are drawn. */ bridge?: number;
  /** 1 = the sign stands at the near end. */ sign?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** How much of the gate is built, 0…1. */ gate?: number;
}

export const BEATS: Ethics25Beat[] = [
  {
    p: 2, x: 40,
    text: 'Somebody stopped you for your own good. Ask whether they had the right.',
    dur: 4.0,
  },
  {
    p: 30, x: 40, bridge: 1,
    text: 'John Stuart Mill drew the line in one sentence, and it’s narrower than it sounds.',
    dur: 4.4,
  },
  {
    p: 36, x: 40, bridge: 1,
    text: 'Power over a grown adult is warranted to stop harm to other people.',
    dur: 4.0,
  },
  {
    p: 160, x: 40, bridge: 1,
    text: 'Their own good is not enough. You may warn them and argue, but never compel.',
    dur: 4.4,
  },
  {
    p: 161, x: 40, bridge: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the only reason Mill lets you compel an adult.',
      explain: 'Harm to other people. Their own good is the reason Mill rules out by name. The bridge case works because the stranger hasn’t been told yet. You’re guessing at their will, not overriding it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 40, bridge: 1, sign: 1,
    text: 'So Mill tests his rule on a bridge with a plank missing, and a stranger walking towards it.',
    dur: 4.8,
  },
  {
    p: 62, x: 96, bridge: 1, sign: 1,
    text: 'Grab them. There’s no time to explain, and nobody wants to fall.',
    dur: 3.8,
  },
  {
    p: 433, x: 96, bridge: 1, sign: 1,
    quote: {
      id: 'lq-ethics-ethics-25-1',
      text: 'The only purpose for which power can be rightfully exercised over any member of a civilised community, against his will, is to prevent harm to others.',
      author: 'John Stuart Mill',
      philosopherId: 'john-stuart-mill',
      work: 'On Liberty',
      era: '1859',
      branchSlugs: ['ethics'],
    },
    dur: 5.0,
  },
  {
    p: 383, x: 96, bridge: 1, sign: 1,
    text: 'Once they’ve read the sign, the bridge is theirs to cross. That’s the whole difference.',
    dur: 4.8,
  },
  {
    p: 21, x: 96, bridge: 1, sign: 1,
    interact: {
      prompt: 'A product harms only the person using it. How far may the state go?',
      drag: {
        lo: 'WARN THEM',
        hi: 'BAN IT',
        start: 0.5,
        zones: [
          { id: 'warn', upto: 0.34, reads: 'put up the sign, and let them walk', correct: true },
          { id: 'nudge', upto: 0.68, reads: 'tax it, cover it in warnings, make it awkward' },
          { id: 'ban', upto: 1, reads: 'close the bridge; nobody crosses' },
        ],
      },
      explain: 'The warning end, on Mill’s own terms. A tax is a mild compulsion aimed at the person themselves, and that’s the thing he ruled out. He’d still allow it where a seller profits from a buyer who hasn’t been told.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Whose Risk Is It',
      points: [
        'Autonomy is your right to run your own life',
        'Paternalism overrides you for your own good',
        'Mill allows compulsion only to stop harm to others',
        'The bridge stop respects a will it cannot ask',
      ],
      closing: 'The real question is rarely whether something is harmful. It’s whose life it is to risk.',
    },
    dur: 4.0,
  },
];
