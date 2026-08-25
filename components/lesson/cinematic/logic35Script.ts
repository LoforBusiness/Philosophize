import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-35, "The Third Thing Doing the Work"
// Theme: TWO BARS THAT RISE TOGETHER, AND THE HAND UNDER BOTH OF THEM.
//
// Two columns climb in step while the reader watches, and an arrow is drawn
// between them — the wrong arrow, the one everybody draws. Then the third box
// rises underneath and the arrow between the columns is cut and re-drawn as two
// arrows coming up from below. The correction is a MOVE on the stage, not a
// sentence about a move.
//
// GAMIFIED SHAPE, and no two asks alike:
//   · beat 3  a SCENE TARGET — three candidate boxes; tap the one feeding both.
//     This is a real hunt: two of the three are plausible and wrong for different
//     reasons, which is what makes it worth a tap rather than a read.
//   · beat 6  an UNGRADED tap — cut the false arrow yourself. Nothing scored;
//     it exists so the reader performs the correction instead of watching it.
//   · beat 7  two CARDS — why randomising beats measuring.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic35Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How high the two columns stand, 0…1. */ rise?: number;
  /** 1 = the straight arrow between the columns is drawn. */ arrow?: number;
  /** 1 = the three candidate boxes are on stage. */ picks?: number;
  /** 1 = the third cause sits under both, with its two arrows up. */ under?: number;
  /** 1 = the false arrow is shown cut. */ cut?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic35Beat[] = [
  {
    p: 25, x: 62, rise: 0,
    text: 'Two things, measured all summer. Watch the two lines move.',
    dur: 2.8,
  },
  {
    p: 2, x: 62, rise: 1,
    text: 'Ice cream sales climb. Drownings climb with them, week for week. The shape is real and it is not a coincidence.',
    dur: 4.2,
  },
  {
    p: 13, x: 62, rise: 1, arrow: 1,
    text: 'So here is the arrow everybody draws. Cones cause drownings. Nobody believes it, and the data does not care what you believe.',
    dur: 4.6,
  },
  {
    p: 4, x: 62, rise: 1, arrow: 1, picks: 1, live: 1,
    interact: {
      prompt: 'Tap the thing that could be feeding both columns.',
      explain: 'Heat. It sells cones and it fills the water, so both climb without either touching the other. Swimming lessons sit in the middle of a real chain, which makes it a mechanism. Holiday pay moves one column and not the other.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 62, rise: 1, picks: 1, under: 1,
    text: 'A cause under both is called a confounder. Take the summer out and the link between cone and drowning vanishes. It was never there.',
    dur: 4.6,
  },
  {
    p: 47, x: 62, rise: 1, under: 1,
    quote: {
      id: 'lq-logic-arguments-35-1',
      text: 'Correlation does not imply causation, but it sure is a hint.',
      author: 'Edward Tufte',
      work: 'Visual Explanations',
      era: '1994',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 35, x: 130, rise: 1, under: 1, cut: 1,
    text: 'The link is rarely this obvious. Children with bigger feet read better, and the whole cause is age. Coffee looked deadly for years because smokers drank coffee.',
    dur: 4.8,
  },
  {
    p: 45, x: 130, rise: 1, under: 1, cut: 1,
    interact: {
      prompt: 'You cannot list every hidden cause. So how does a coin flip beat a longer list?',
      cards: [
        { text: 'Cuts links you never listed', correct: true },
        { text: 'It makes the sample bigger', correct: false },
      ],
      explain: 'Size fixes noise, not bias — a huge biased study is confidently wrong. A coin decides who is treated, so nothing else can be deciding, and that covers the causes you never listed. Those are the ones that get you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Look For The Third Thing',
      points: [
        'Two lines rising together may share a cause',
        'A confounder feeds both, not one through the other',
        'Measuring only handles what you thought of',
        'Randomising cuts every incoming link at once',
      ],
      closing: 'Next time two lines climb together, ask what season they are both standing in.',
    },
    dur: 3.0,
  },
];
