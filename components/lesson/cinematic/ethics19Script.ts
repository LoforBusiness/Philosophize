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
    p: 25, x: 200, doc: 1, rows: 1,
    text: 'Four decisions, all about the same life. Yours.',
    dur: 3.4,
  },
  {
    p: 45, x: 200, doc: 1, rows: 1, taken: 1,
    text: 'Now watch the last column. Somebody has signed three of them off on your behalf, for your own good.',
    cite: 'Paternalism',
    dur: 4.6,
  },
  {
    p: 13, x: 132, doc: 1, rows: 1, affects: 1, taken: 1,
    text: 'Mill thought there was one honest test, and it is the middle column. Not how risky the choice is. Who else is in it.',
    dur: 4.8,
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
    p: 2, x: 132, doc: 1, rows: 1, affects: 1, taken: 1,
    text: 'Three of those signatures do not belong to the person who wrote them. One of them does.',
    dur: 4.0,
  },
  {
    p: 4, x: 132, doc: 1, rows: 1, affects: 1, taken: 1, live: 1,
    interact: {
      prompt: 'Tap the one line somebody else may sign.',
      explain: 'Driving after drinking. Mill\'s test is not how risky the choice is. It is whether anybody else is in it. The other three are dangerous or foolish or both, and they are still yours. Danger to yourself never hands somebody else the pen.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 268, doc: 1, rows: 1, affects: 1,
    text: 'The rule is easy while the choices are small. It gets expensive at the end of a life.',
    cite: 'The hard case',
    dur: 4.2,
  },
  {
    p: 41, x: 268, doc: 1, rows: 1, affects: 1,
    interact: {
      prompt: 'Someone competent refuses treatment that would save them. What follows?',
      cards: [
        { text: 'Their refusal stands', correct: true },
        { text: 'Save them, then ask', correct: false },
      ],
      explain: 'Their refusal stands. This is the hardest case for the harm principle, and Mill takes it. A competent adult may make a choice that is plainly bad for them. Overriding it treats a person as a thing to be managed.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Who Holds the Pen',
      points: [
        'The harm principle asks who else your choice reaches',
        'Risk to yourself is not a licence for anyone else',
        'Competence is what makes a refusal binding',
        'The rule is only worth having where it costs something',
      ],
      closing: 'Three of those lines were never anybody else\'s to sign.',
    },
    dur: 3.2,
  },
];
