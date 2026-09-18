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
  /** 1 = a stop-line marks the edge of the gap: the limit of justified power. */ limit?: number;
  /** 1 = a dashed nudge and a struck bar: persuasion allowed, force is not. */ method?: number;
  /** 1 = a small fork over the far deck: his own choice, once he is told. */ choice?: number;
}

export const BEATS: Ethics25Beat[] = [
  {
    p: 2, x: 40,
    text: 'Paternalism is interference with a person’s liberty for that person’s own good. When, if ever, is it justified?',
    dur: 4.0,
  },
  {
    p: 30, x: 40, bridge: 1,
    text: 'John Stuart Mill proposed one principle in On Liberty, in 1859. It’s known as the harm principle.',
    dur: 4.4,
  },
  {
    p: 36, x: 40, bridge: 1, limit: 1,
    text: 'On this principle, power over an adult is justified only to prevent harm to others.',
    dur: 4.0,
  },
  {
    p: 160, x: 40, bridge: 1, method: 1,
    text: 'For Mill, a person’s own good is not a sufficient warrant for compulsion. It justifies persuasion, but never force.',
    dur: 4.4,
  },
  {
    p: 161, x: 40, bridge: 1, plates: 1, live: 1,
    interact: {
      prompt: 'On the harm principle, which reason can justify compelling an adult?',
      explain: 'Harm to others. Their own good is the reason Mill rules out. In the bridge case, stopping someone not yet told doesn’t override their will, because nobody wants to fall.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 40, bridge: 1, sign: 1,
    text: 'Mill tests the principle on a bridge known to be unsafe. A stranger is walking towards the gap, and there’s no time to warn him.',
    dur: 4.8,
  },
  {
    p: 62, x: 96, bridge: 1, sign: 1,
    text: 'Mill says you may seize him and turn him back. This is no real infringement of liberty, because he doesn’t want to fall.',
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
    p: 383, x: 96, bridge: 1, sign: 1, choice: 1,
    text: 'Once the stranger is warned, Mill holds, he may decide for himself whether the risk is worth taking. A warning informs his will, whereas force would override it.',
    dur: 4.8,
  },
  {
    p: 21, x: 96, bridge: 1, sign: 1,
    interact: {
      prompt: 'If a product harms only its user, how far does Mill’s principle let the state go?',
      drag: {
        lo: 'WARN THEM',
        hi: 'BAN IT',
        start: 0.5,
        zones: [
          { id: 'warn', upto: 0.34, reads: 'require a warning, and let adults choose', correct: true },
          { id: 'nudge', upto: 0.68, reads: 'tax it heavily to discourage its use' },
          { id: 'ban', upto: 1, reads: 'forbid its sale to everyone' },
        ],
      },
      explain: 'Require a warning, and let adults choose. Mill allows labelling, because a warning informs a choice without overriding it. A tax meant to discourage use differs from a ban only in degree, he argues, so he rejects it too.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Paternalism and the Harm Principle',
      points: [
        'Autonomy is the right to govern your own life',
        'Paternalism interferes with a person for their own good',
        'Mill allows compulsion only to stop harm to others',
        'Mill: seizing the unwarned stranger doesn’t violate liberty',
      ],
      closing: 'For Mill, the question isn’t whether an act is harmful. It’s whom the act harms.',
    },
    dur: 4.0,
  },
];
