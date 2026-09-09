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
}

export const BEATS: Metaphysics40Beat[] = [
  {
    p: 420, x: 40,
    text: 'Tomorrow either rains or does not rain. Nothing could sound safer.',
    dur: 4.2,
  },
  {
    p: 158, x: 40, ledger: 0.5,
    text: 'Logic has a rule: every statement is either true or false.',
    dur: 3.4,
  },
  {
    p: 448, x: 40, ledger: 1, written: 0.67,
    text: 'Point that rule at tomorrow and one of the two is true already, today.',
    dur: 4.0,
  },
  {
    p: 168, x: 40, ledger: 1, written: 0.67,
    text: 'Aristotle imagined two admirals arguing the night before a sea battle. One of them was right while they spoke.',
    dur: 4.6,
  },
  {
    p: 161, x: 40, ledger: 1, written: 0.67, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what the rule puts on tomorrow\'s line.',
      explain: 'One of the two, already. That is the rule applied to a day nobody has lived. Both at once is not something any logic offers, and leaving it blank is a real escape — it is the one Aristotle takes, and it costs him the rule.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 446, x: 104, ledger: 1, written: 0.67,
    text: 'So Aristotle refused the rule here. Tomorrow\'s line is neither true nor false yet.',
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
    text: 'There is a cheaper door. Let the line be written, and deny that writing it forces anything.',
    dur: 4.6,
  },
  {
    p: 267, x: 104, ledger: 1, written: 0.67,
    interact: {
      prompt: 'What holds for tomorrow, right now?',
      poll: {
        options: [
          { id: 'shut', reads: 'settled already, and nothing can change it', holders: ['Chrysippus'] },
          { id: 'blank', reads: 'neither true nor false yet', holders: ['Aristotle'] },
          { id: 'open', reads: 'settled, and yet nothing is forced', holders: ['Boethius', 'William of Ockham'], correct: true },
        ],
      },
      explain: 'The third. It is true that you will finish this sentence, and you are finishing it freely — truth is a record, not a rope. Aristotle took the second door and paid a law of logic for it. The first door takes the rope for granted.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 437, x: 104, ledger: 1, written: 1,
    summary: {
      title: 'The Blank Line',
      points: [
        'Every statement is true or false, says the rule',
        'Aimed at tomorrow, it seems to settle tomorrow',
        'Aristotle left that one line neither, for now',
        'The cheaper escape denies that true means forced',
      ],
      closing: 'Every answer here costs something — a law of logic, or an open tomorrow. Working out which you would rather pay is the exercise.',
    },
    dur: 4.0,
  },
];
