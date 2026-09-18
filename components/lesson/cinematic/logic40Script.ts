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
  /**
   * 1 = a small balance needle between the two cards tips toward GREEN once,
   * then levels off — showing the claim that green seems simpler give way to
   * it depending on which predicates a language takes as basic.
   */
  balance?: number;
}

export const BEATS: Logic40Beat[] = [
  {
    p: 356, x: 36,
    text: 'Consider a simple case of induction: every emerald checked so far has been green.',
    dur: 3.6,
  },
  {
    p: 169, x: 36, tray: 1, checked: 0.67,
    text: 'Each observation supports the claim that every emerald is green.',
    dur: 3.6,
  },
  {
    p: 429, x: 36, tray: 1, checked: 0.67, rules: 0.5,
    text: 'Nelson Goodman defined a new predicate, grue. A stone is grue if it’s checked before tonight and is green, or not checked before tonight and is blue.',
    dur: 4.6,
  },
  {
    p: 259, x: 36, tray: 1, checked: 0.67, rules: 1, links: 1,
    text: 'Every stone checked so far was checked before tonight and was green. So every stone on record is grue as well.',
    dur: 4.6,
  },
  {
    p: 261, x: 36, tray: 1, checked: 0.67, rules: 1, links: 1, live: 1,
    interact: {
      prompt: 'Which stone do the two rules disagree about?',
      explain: 'The stone no one has checked. Grue was defined to agree with green on every stone checked before tonight. So no checked stone can separate the two rules. They disagree only about stones not yet examined.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 421, x: 96, tray: 1, checked: 0.67, rules: 1, links: 1,
    text: 'The two rules conflict about a stone first checked tomorrow. The green rule predicts green, and the grue rule predicts blue.',
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
    p: 348, x: 96, tray: 1, checked: 0.67, rules: 1, links: 1, balance: 1,
    text: 'Green seems the simpler predicate. However, simplicity depends on which predicates a language takes as basic.',
    dur: 4.2,
  },
  {
    p: 266, x: 96, tray: 1, checked: 0.67, rules: 1, links: 1,
    interact: {
      prompt: 'How should the support of the checked stones be divided between the two rules?',
      split: {
        left: 'GREEN',
        right: 'GRUE',
        start: 0.94,
        zones: [
          { id: 'grue', upto: 0.34, reads: 'the evidence favours grue, since green is artificial' },
          { id: 'even', upto: 0.66, reads: 'the evidence supports both rules equally', correct: true },
          { id: 'green', upto: 1, reads: 'the evidence favours green, since grue is artificial' },
        ],
      },
      explain: 'The evidence supports both rules equally. Every checked stone is both green and grue. To a speaker who began with grue, green would be the predicate that mentions a time. Goodman held that green is preferred because it has a longer history of use in predictions.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 96, tray: 1, checked: 0.67, rules: 1, links: 1,
    summary: {
      title: 'Goodman’s New Riddle of Induction',
      points: [
        'Grue matches green on every case ever checked',
        'The two rules differ only about unexamined cases',
        'Evidence alone cannot choose between them',
        'Goodman prefers green because it is better entrenched',
      ],
      closing: 'Hume asked why the past should guide beliefs about the future. Goodman asks which features of the past should guide them.',
    },
    dur: 4.2,
  },
];
