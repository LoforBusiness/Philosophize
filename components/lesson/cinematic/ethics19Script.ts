import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-19, "Whose Life, Whose Choice?"
// Theme: A FORM ABOUT ONE PERSON, WITH SOMEBODY ELSE SIGNING THE LINES.
//
// Autonomy is usually taught as a boundary, and the branch already has a
// boundary lesson two doors down, so this one is built out of the other thing
// the harm principle really is: a rule about WHO SIGNS. Four decisions about one
// life are set out as rows on a form, each with a column saying who else is in
// it and a slot saying who signed it off.
//
// The paternalist move is then something the reader watches happen rather than
// something they are told about — a second name appearing in slots that were
// never his to sign. Mill's test is the AFFECTS column, and it is drawn beside
// every row from the start so the reader can run the test before being told it.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — four rows, tap the one line somebody else may
//     sign. The three decoys are all genuinely dangerous choices, which is the
//     point: risk is not the criterion and a set of harmless decoys would have
//     taught the wrong rule (H66).
//   · beat 7  two CARDS — the hardest case, where the rule costs something.
// ─────────────────────────────────────────────────────────────────────────────

export interface Eth19Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The form, its columns and its header, 0…1. */ doc?: number;
  /** How many of the four rows are written, 0…1. */ rows?: number;
  /** The AFFECTS column filled in beside each row, 0…1. */ affects?: number;
  /** Somebody else's name appearing in slots, 0…1. */ taken?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Eth19Beat[] = [
  {
    p: 172, x: 200, doc: 1, rows: 1,
    text: 'Consider four decisions, each about your own life, and who is entitled to make them.',
    dur: 3.4,
  },
  {
    p: 45, x: 200, doc: 1, rows: 1, taken: 1,
    text: 'Paternalism is interfering with a person’s choices for their own good. Here, the state has decided three of them for you.',
    cite: 'Paternalism',
    dur: 4.6,
  },
  {
    p: 13, x: 132, doc: 1, rows: 1, affects: 1, taken: 1,
    text: 'John Stuart Mill proposed a single test, and it doesn’t concern how risky a choice is.',
    dur: 3.8,
  },
  {
    p: 266, x: 132, doc: 1, rows: 1, affects: 1, taken: 1,
    text: 'The test asks whether the choice harms anyone other than the person making it.',
    dur: 1.8,
  },
  {
    p: 137, x: 132, doc: 1, rows: 1, affects: 1, taken: 1,
    quote: {
      id: 'lq-ethics-ethics-19-2',
      text: 'The only purpose for which power can be rightfully exercised over any member of a civilised community, against his will, is to prevent harm to others.',
      author: 'John Stuart Mill',
      work: 'On Liberty',
      era: '1859',
      philosopherId: 'john-stuart-mill',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 384, x: 132, doc: 1, rows: 1, affects: 1, taken: 1,
    text: 'Three rows are signed by the state, and one by you. Mill’s test asks which of these signatures is legitimate.',
    dur: 4.0,
  },
  {
    p: 165, x: 132, doc: 1, rows: 1, affects: 1, taken: 1, live: 1,
    interact: {
      prompt: 'By Mill’s harm principle, which decision may the state rightly make for you?',
      explain: 'Driving after drinking, because it endangers other people. Mill’s test is harm to others, not risk to yourself. Unhealthy food and riding without a helmet are risky, but the risk falls on you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 467, x: 268, doc: 1, rows: 1, affects: 1,
    text: 'The harm principle is easy to accept while the choices are small. It’s hardest to accept when refusing treatment will end a life.',
    cite: 'The hard case',
    dur: 4.2,
  },
  {
    p: 383, x: 268, doc: 1, rows: 1, affects: 1,
    interact: {
      prompt: 'If a competent adult refuses life-saving treatment, what does the harm principle permit?',
      drag: {
        lo: 'THE REFUSAL STANDS',
        hi: 'SAVE THEM ANYWAY',
        start: 1,
        zones: [
          { id: 'stands', upto: 0.3, reads: 'their refusal stands, however bad the choice looks', correct: true },
          { id: 'delay', upto: 0.66, reads: 'treat them now, ask again later' },
          { id: 'save', upto: 1, reads: 'save them whatever they say' },
        ],
      },
      explain: 'Their refusal stands, however bad the choice looks. This is the hardest case for the harm principle, yet Mill’s test still applies. A competent adult’s choice that harms no one else is theirs to make.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Harm Principle',
      points: [
        'The harm principle asks whether a choice harms others',
        'Risk to yourself doesn’t justify interference by others',
        'Competence is what makes a refusal binding',
        'The principle is tested most where it costs a life',
      ],
      closing: 'By Mill’s test, only the decision that endangers others was the state’s to make.',
    },
    dur: 3.2,
  },
];
