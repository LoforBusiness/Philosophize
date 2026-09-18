import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-40, "Is There a Fact About Tomorrow?"
// Theme: A LEDGER OF DAYS WHOSE LAST LINE IS BLANK UNTIL SOMEBODY FILLS IT.
//
// The sea-battle argument is about a TRUTH VALUE arriving early, so the scene
// draws a book of days: yesterday and today carry an entry, and tomorrow carries
// a ruled line with nothing on it. Bivalence is then not a slogan — it is a hand
// writing on that line before the day has happened.
//
// The clasp is the second half of the argument and it is drawn separately on
// purpose. A written line says tomorrow is SETTLED; a clasp closed over it says
// tomorrow is FORCED. Nearly everything interesting here lives in the gap
// between those two, and a picture that fused them would beg the question.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what the rule
//     puts on tomorrow's line. On the stage because the line is already drawn
//     above it, empty, and the answer is a mark going onto it.
//   · beat 8  a POLL — the three doors out, and who walked through each. The
//     reader's own answer writes the line and shuts or leaves the clasp, so the
//     position they take is the picture they get.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics40Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How much of the book of days is drawn, 0…1. */ ledger?: number;
  /** How many lines carry an entry: 0 none, 0.67 the two past ones, 1 all three. */ written?: number;
  /** 1 = the clasp is shut over tomorrow's line — settled AND forced. */ clasp?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a small ship is drawn on the sea, the battle Aristotle's example predicts. */ ship?: number;
}

export const BEATS: Metaphysics40Beat[] = [
  {
    p: 420, x: 40,
    text: 'Tomorrow it will either rain or not rain. That either-or statement, called a disjunction, seems beyond doubt.',
    dur: 4.2,
  },
  {
    p: 158, x: 40, ledger: 0.5,
    text: 'Classical logic accepts the principle of bivalence. It holds that every statement is either true or false.',
    dur: 3.4,
  },
  {
    p: 448, x: 40, ledger: 1, written: 0.67,
    text: 'Applied to tomorrow, bivalence implies that one of the two predictions is already true today.',
    dur: 4.0,
  },
  {
    p: 168, x: 40, ledger: 1, written: 0.67, ship: 1,
    text: 'In Aristotle’s example, a sea battle is predicted for tomorrow. If the prediction is true today, the battle seems bound to happen.',
    dur: 4.6,
  },
  {
    p: 161, x: 40, ledger: 1, written: 0.67, plates: 1, live: 1, ship: 1,
    interact: {
      prompt: 'What does bivalence assign to a statement about tomorrow, before the day has come?',
      explain: 'One of the two. Bivalence makes every statement true or false, even one about a day to come. “Nothing yet” denies bivalence, and that’s Aristotle’s reply on the traditional reading.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 446, x: 104, ledger: 1, written: 0.67,
    text: 'On the traditional reading, Aristotle denies bivalence for future contingents, claims about what may or may not happen. Such a claim is neither true nor false yet.',
    dur: 4.4,
  },
  {
    p: 430, x: 104, ledger: 1, written: 0.67,
    quote: {
      id: 'lq-metaphysics-being-40-1',
      text: 'A sea-fight must either take place tomorrow or not, but it is not necessary that it should take place tomorrow.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'On Interpretation',
      era: 'c. 350 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 4.4,
  },
  {
    p: 393, x: 104, ledger: 1, written: 1,
    text: 'A second reply, defended by William of Ockham, keeps bivalence. It accepts that a prediction can be true now, but denies that truth makes the event necessary.',
    dur: 4.6,
  },
  {
    p: 267, x: 104, ledger: 1, written: 0.67,
    interact: {
      prompt: 'What is the status, today, of a prediction about tomorrow’s sea battle?',
      poll: {
        options: [
          { id: 'shut', reads: 'already true or false, and so necessary', holders: ['Diodorus Cronus'] },
          { id: 'blank', reads: 'neither true nor false yet', holders: ['Aristotle', 'Epicurus'] },
          { id: 'open', reads: 'already true or false, yet not necessary', holders: ['William of Ockham'], correct: true },
        ],
      },
      explain: 'Already true or false, yet not necessary. A prediction is true because of what will happen, so its truth can’t force the event. “Neither true nor false yet” also avoids necessity, but only by giving up bivalence.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 437, x: 104, ledger: 1, written: 1,
    summary: {
      title: 'Bivalence and the Future',
      points: [
        'Bivalence holds that every statement is either true or false',
        'Applied to tomorrow, it seems to make the future necessary',
        'On the traditional reading, Aristotle denies bivalence for future contingents',
        'Ockham’s reply denies that truth now implies necessity',
      ],
      closing: 'Denying bivalence gives up a law of logic. Keeping bivalence means accepting a fixed future, or showing that truth doesn’t fix it.',
    },
    dur: 4.0,
  },
];
