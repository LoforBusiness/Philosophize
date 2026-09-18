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
  /** 1 = a record mark by the improvised row — it has begun acquiring a fixed
   *  version. */ rec?: number;
  /** 1 = a bracket ties the two staves — the sound now matches, though what it
   *  is still differs. */ tie?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aesthetics37Beat[] = [
  {
    p: 379, x: 54, staves: 1, score: 1,
    text: 'Consider two performances. The upper piece was written in advance, so every note existed before anyone came on stage.',
    dur: 3.8,
  },
  {
    p: 384, x: 54, staves: 1, score: 1, played: 1,
    text: 'The lower row is an improvised solo. Each note is decided as it’s played, with no score to compare it against.',
    dur: 4.2,
  },
  {
    p: 165, x: 54, staves: 1, score: 1, played: 1, live: 1,
    interact: {
      prompt: 'Which performance has no prior work that it’s a performance of?',
      explain: 'The row made up tonight. A composed piece exists before its performance, so a wrong note counts as a mistake. An improvised solo has no prior work to get wrong, because playing it and making it are the same act.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 54, staves: 1, score: 1, played: 1,
    text: 'A symphony isn’t its score, so you can burn every copy of a symphony and it survives. An unrecorded solo ends when the playing stops.',
    dur: 4.8,
  },
  {
    p: 386, x: 54, staves: 1, score: 1, played: 1,
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
    p: 309, x: 54, staves: 1, score: 1, played: 1, rec: 1,
    text: 'Recording changed this. Players began learning famous solos note for note, so an event meant to happen once acquired a correct version.',
    dur: 4.8,
  },
  {
    p: 457, x: 54, staves: 1, score: 1, played: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'Once a solo is transcribed and learned note for note, what has it become?',
      drag: {
        lo: 'MADE UP TONIGHT',
        hi: 'WRITTEN DOWN',
        start: 0,
        zones: [
          { id: 'live', upto: 0.3, reads: 'an event with nothing to get wrong' },
          { id: 'mid', upto: 0.66, reads: 'a familiar tune, loosely remembered' },
          { id: 'text', upto: 1, reads: 'a composition that can be played wrongly', correct: true },
        ],
      },
      explain: 'A composition that can be played wrongly. The notes survived transcription, but the improvising didn’t. What sits on the stave is now a composition with an unusual history. It began as a series of decisions and is now a text to follow.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 126, staves: 1, score: 1, lift: 1,
    text: 'The same sounds can be two different kinds of thing, depending on whether a composition preceded them.',
    dur: 4.1,
  },
  {
    p: 167, x: 126, staves: 1, score: 1, lift: 1, tie: 1,
    text: 'The difference lies not in how the music sounds, but in what the music is.',
    dur: 1.8,
  },
  {
    summary: {
      title: 'The Ontology of Improvisation',
      points: [
        'A composed work exists before its performances',
        'An improvisation has no work prior to its performance',
        'The improvised performance is itself the work',
        'Transcribing it turns it into a composition',
      ],
      closing: 'An unrecorded improvisation exists only while it’s being made. To hear the work, you must be present at its making.',
    },
    dur: 3.2,
  },
];
