import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-40, "Green, or Grue?"
// Theme: TWO RULES HANGING OVER ONE TRAY, AND THE STONE NEITHER HAS SEEN.
//
// Goodman's riddle is about EVIDENCE THAT DOES NOT CHOOSE, so the scene draws two
// rule cards feeding down into a single tray. One tray, two feeds, and nothing in
// the picture to prefer either — which is the argument, laid out rather than
// asserted.
//
// The third stone is drawn from the moment the tray opens, and it is drawn
// EMPTY. A rule is a promise about cases nobody has reached, so the case nobody
// has reached has to be visible from the start; introducing it late would make
// the riddle look like a twist rather than the thing that was always there.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — the stones themselves, and the reader taps the one
//     the two rules disagree about. Round targets on round art, which is what
//     `Target`'s radius is for (E38).
//   · beat 8  a SPLIT — the tray divided between the two rules. Every seam the
//     reader can reach is a claim somebody makes about simplicity, and the middle
//     is the one the riddle actually leaves you with.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic40Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the two rule cards are up, 0…1. */ rules?: number;
  /** 1 = the feeds from each rule card down into the tray are drawn. */ links?: number;
  /** 1 = the tray of stones is on. */ tray?: number;
  /** How many of the three stones carry a check mark, 0…1. */ checked?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic40Beat[] = [
  {
    p: 356, x: 36,
    text: 'Every emerald anybody has ever checked came out green.',
    dur: 3.6,
  },
  {
    p: 169, x: 36, tray: 1, checked: 0.67,
    text: 'A great many stones, and every one of them says the same thing.',
    dur: 3.6,
  },
  {
    p: 429, x: 36, tray: 1, checked: 0.67, rules: 0.5,
    text: 'Now a new word. A stone is grue if it looks green when checked before tonight.',
    dur: 4.6,
  },
  {
    p: 259, x: 36, tray: 1, checked: 0.67, rules: 1, links: 1,
    text: 'Nobody has checked one after tonight. So every stone on record is grue as well.',
    dur: 4.6,
  },
  {
    p: 261, x: 36, tray: 1, checked: 0.67, rules: 1, links: 1, live: 1,
    interact: {
      prompt: 'Tap the stone the two rules disagree about.',
      explain: 'The one nobody has checked. Grue was built to match green on every case already in the tray. No checked stone can tell them apart. The disagreement stays invisible until you reach for the next one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 421, x: 96, tray: 1, checked: 0.67, rules: 1, links: 1,
    text: 'Pull a fresh stone out tomorrow and green calls it green. Grue calls it blue.',
    dur: 4.4,
  },
  {
    p: 426, x: 96, tray: 1, checked: 0.67, rules: 1, links: 1,
    quote: {
      id: 'lq-logic-arguments-40-1',
      text: 'Regularities are where you find them, and you can find them anywhere.',
      author: 'Nelson Goodman',
      work: 'Fact, Fiction, and Forecast',
      era: '1955',
      branchSlugs: ['logic'],
    },
    dur: 4.0,
  },
  {
    p: 348, x: 96, tray: 1, checked: 0.67, rules: 1, links: 1,
    text: 'Green looks simpler. But simple depends on which words you started with.',
    dur: 4.2,
  },
  {
    p: 266, x: 96, tray: 1, checked: 0.67, rules: 1, links: 1,
    interact: {
      prompt: 'Divide the tray between the two rules.',
      split: {
        left: 'GREEN',
        right: 'GRUE',
        start: 0.94,
        zones: [
          { id: 'grue', upto: 0.34, reads: 'the stones back grue, and green is odd' },
          { id: 'even', upto: 0.66, reads: 'the stones back both, exactly alike', correct: true },
          { id: 'green', upto: 1, reads: 'the stones back green, and grue is a trick' },
        ],
      },
      explain: 'Down the middle. Every stone in the tray fits both rules, so the evidence has nothing to say. Somebody whose language began with grue would find green the fiddly word, the one that mentions a time. Goodman answered that green is only the older habit.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 96, tray: 1, checked: 0.67, rules: 1, links: 1,
    summary: {
      title: 'The Next Stone',
      points: [
        'Grue matches green on every case ever checked',
        'The rules split only on cases still to come',
        'Evidence alone cannot choose between them',
        'Habit chooses green, and habit is not a proof',
      ],
      closing: 'Induction was hard enough when the worry was whether the future resembles the past. Goodman asks a sharper question: resembles the past in what respect?',
    },
    dur: 4.2,
  },
];
