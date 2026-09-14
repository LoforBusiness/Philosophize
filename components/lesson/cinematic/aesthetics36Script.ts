import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-36, "Does a Photograph Tell the Truth?"
// Theme: ONE SQUARE, ONE VIEWFINDER, AND THE READER CHOOSING THE EDGES.
//
// The stage is a wide strip of a real place: a dense crowd at one end, a thinning
// middle, one man alone at the other. Above it a viewfinder the reader slides.
// Nothing inside it is ever altered — the marks do not move, appear or vanish —
// and the caption under the finder keeps changing anyway.
//
// That is the argument, and it cannot be made in a sentence as well as it can be
// made with a thumb. The reader produces three incompatible true photographs of
// one square in about four seconds.
//
// GAMIFIED SHAPE:
//   · beat 2  a DRAG — slide the frame. The readout is the headline the picture
//     would run under, so the reader watches themself write three of them.
//   · beat 6  two CARDS — whether heavy editing makes it something else. A card
//     question on purpose: it is the one beat here that is genuinely a fork
//     rather than something to be looked at.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics36Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the square and its people are drawn. */ square?: number;
  /** Where the viewfinder sits, 0 (the crowd) … 1 (the lone man). */ crop?: number;
  /** 1 = the reader's thumb is driving the viewfinder. */ live_d?: number;
  /** 1 = the two printed results hang below, both true. */ prints?: number;
}

export const BEATS: Aesthetics36Beat[] = [
  {
    p: 164, x: 54, square: 1,
    text: 'Consider one square on one afternoon. A dense crowd fills one end, and a single man stands at the other.',
    dur: 2.4,
  },
  {
    p: 164, x: 54, square: 1,
    text: 'Everything in the square is real, and none of it will be altered.',
    dur: 1.8,
  },
  {
    p: 457, x: 54, square: 1, live_d: 1,
    interact: {
      prompt: 'Which crop of the square supports the least misleading caption?',
      drag: {
        lo: 'FRAME THE CROWD',
        hi: 'FRAME THE MAN',
        start: 0.5,
        zones: [
          { id: 'packed', upto: 0.3, reads: 'THOUSANDS TURN OUT' },
          { id: 'mid', upto: 0.68, reads: 'A MODEST TURNOUT', correct: true },
          { id: 'alone', upto: 1, reads: 'NOBODY CAME' },
        ],
      },
      explain: 'A modest turnout. None of the three photographs is faked, yet the two ends support opposite headlines. The middle frame favours neither end. Even so, it’s a choice, and the photograph doesn’t show that it was made.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, x: 54, square: 1, crop: 0.5, prints: 1,
    text: 'Neither print has been manipulated, since no pixel was moved, added or removed.',
    dur: 1.8,
  },
  {
    p: 13, x: 54, square: 1, crop: 0.5, prints: 1,
    text: 'Both prints are accurate, yet they imply opposite accounts of what happened.',
    dur: 2.6,
  },
  {
    p: 467, x: 54, square: 1, crop: 0.5, prints: 1,
    text: 'Photographs have this power because they’re made mechanically, by light from the scene itself.',
    dur: 2.6,
  },
  {
    p: 467, x: 54, square: 1, crop: 0.5, prints: 1,
    text: 'Kendall Walton argues that photographs are transparent: through them, you literally see the square itself.',
    dur: 2.2,
  },
  {
    p: 47, x: 54, square: 1, crop: 0.5, prints: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-36-1',
      text: 'The photograph is literally an emanation of the referent.',
      author: 'Roland Barthes',
      philosopherId: 'roland-barthes',
      work: 'Camera Lucida',
      era: '1980',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 35, x: 128, square: 1, crop: 0.5, prints: 1,
    interact: {
      prompt: 'If every photograph is processed, what makes an edited photograph a lie?',
      cards: [
        { text: 'Breaking what viewers were promised', correct: true },
        { text: 'Any edit to the pixels', correct: false },
      ],
      explain: 'Breaking what viewers were promised. Every photo is edited, at least in its light, contrast and crop. So edits alone can’t tell news from advertising. What differs is the promise made to the viewer.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 12, x: 128, square: 1, crop: 0.14, prints: 1,
    text: 'A painting misleads less by framing, because no viewer assumes a painting is neutral. Everyone knows a painter made choices.',
    dur: 3.3,
  },
  {
    p: 12, x: 128, square: 1, crop: 0.14, prints: 1,
    text: 'With a photograph, viewers easily forget that a photographer also made choices.',
    dur: 1.8,
  },
  {
    summary: {
      title: 'How a True Photograph Misleads',
      points: [
        'A photograph feels like seeing the thing itself',
        'Trust in photographs gives framing its power',
        'A crop misleads with nothing fabricated',
        'Deception depends on the promise made, not the pixels',
      ],
      closing: 'An accurate photograph can still mislead. The useful questions are what was cropped out, and who chose the frame.',
    },
    dur: 3.2,
  },
];
