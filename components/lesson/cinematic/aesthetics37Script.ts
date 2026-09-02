import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-37, "Where Is a Jazz Solo?"
// Theme: TWO STAVES. ONE HAS NOTES ON IT BEFORE ANYONE PLAYS.
//
// The ontology is a layout. A composed piece is drawn as a score ABOVE and a
// performance BELOW, with lines from each note down to the sound it produced —
// the performance is of something. The improvisation has the same lower row and
// an empty upper stave, and the lines go nowhere.
//
// The notes on the improvised row appear one at a time, left to right, at the
// speed of the beat clock, so they are visibly being decided rather than
// executed. The composed row's notes are all there from the first frame.
//
// GAMIFIED SHAPE:
//   · beat 3  a SCENE TARGET — tap the row that has nothing standing behind it.
//   · beat 7  a DRAG — transcribe the solo. As the reader slides, the notes climb
//     from the lower stave to the upper one and the readout moves from "made up"
//     to "a piece to get right". They perform the thing the lesson is about.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics37Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two systems are drawn. */ staves?: number;
  /** 1 = the composed row's score is filled in above. */ score?: number;
  /** How much of the improvised row has been played, 0…1. */ played?: number;
  /** How far the solo has been transcribed upward, 0…1. */ lift?: number;
  /** 1 = the reader's thumb is doing the transcribing. */ live_d?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aesthetics37Beat[] = [
  {
    p: 25, x: 54, staves: 1, score: 1,
    text: 'Two performances tonight. The top one is a written piece — every note existed before anybody walked on.',
    dur: 3.8,
  },
  {
    p: 2, x: 54, staves: 1, score: 1, played: 1,
    text: 'The bottom line is a solo. Watch the line arrive with nothing above it and nothing to compare it against.',
    dur: 4.2,
  },
  {
    p: 4, x: 54, staves: 1, score: 1, played: 1, live: 1,
    interact: {
      prompt: 'Tap the row with nothing standing behind it.',
      explain: 'The lower one. The written piece has something the performance is a performance OF, so a wrong note is a mistake. There is nothing for the solo to be wrong about, because the playing and the making are the same act.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 54, staves: 1, score: 1, played: 1,
    text: 'Which is why you can burn every copy of a symphony and it survives. Do that to an improvisation and there is nothing left to recover.',
    dur: 4.8,
  },
  {
    p: 47, x: 54, staves: 1, score: 1, played: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-37-1',
      text: 'The improviser makes the work in the act of performing it.',
      author: 'Philip Alperson',
      work: 'On Musical Improvisation',
      era: '1984',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 13, x: 54, staves: 1, score: 1, played: 1,
    text: 'Then recording arrived, and players started learning famous solos note for note. Something meant to happen once acquired a correct version.',
    dur: 4.8,
  },
  {
    p: 4, x: 54, staves: 1, score: 1, played: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'Transcribe it. Slide the solo up onto the stave.',
      drag: {
        lo: 'MADE UP TONIGHT',
        hi: 'WRITTEN DOWN',
        start: 0,
        zones: [
          { id: 'live', upto: 0.3, reads: 'nothing to get wrong' },
          { id: 'mid', upto: 0.66, reads: 'a tune people know' },
          { id: 'text', upto: 1, reads: 'a piece to get right', correct: true },
        ],
      },
      explain: 'The notes survived the trip and the making-it-up did not. What sits on the stave now is a composition with an odd history: it began as something being decided and it is now something being followed.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 126, staves: 1, score: 1, lift: 1,
    text: 'So the same sounds become a different kind of thing depending on what stood behind them. Not how the sounds strike the ear.',
    dur: 4.1,
  },
  {
    p: 35, x: 126, staves: 1, score: 1, lift: 1,
    text: 'What the sounds are.',
    dur: 1.8,
  },
  {
    summary: {
      title: 'Made While You Watch',
      points: [
        'A score stands behind its performances',
        'An improvisation has nothing standing behind it',
        'So the performance is the work, not a copy',
        'Transcribing it turns it into a composition',
      ],
      closing: 'It is the one art where being there for the making is not a privilege. It is the only way the thing exists at all.',
    },
    dur: 3.2,
  },
];
