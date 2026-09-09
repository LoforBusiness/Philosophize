import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-41, "Where Does the Work Stop?"
// Theme: A CANVAS IN A FRAME ON A WALL, AND A LINE THAT WILL NOT SETTLE.
//
// This is a question about a BOUNDARY, so the scene draws the three candidates as
// three nested regions and then draws the boundary itself as a separate object
// that can be moved between them. The argument is where the ring lands.
//
// The ring has two forms and the difference is the whole conclusion: SOLID when
// the reader puts the frame decisively in or out, and DASHED when they leave it
// neither. A dashed line is the only mark in this vocabulary that says "here, and
// also not quite here", which is what a parergon is.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps which of the
//     three Kant meant. On the stage because the canvas, the frame and the wall
//     are all in front of them, nested.
//   · beat 8  a SORT — the frame itself, dropped into a category. The ring closes
//     round the canvas, opens round the frame, or goes dashed and sits on it.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics41Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the wall is drawn. */ wall?: number;
  /** 1 = the framed canvas is hung on it. */ art?: number;
  /** 1 = the boundary ring is drawn at all. */ ring?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aesthetics41Beat[] = [
  {
    p: 423, x: 28, wall: 1, art: 1,
    text: 'Point at the edge of a painting, then say whether your finger is on it.',
    dur: 4.4,
  },
  {
    p: 262, x: 28, wall: 1, art: 1,
    text: 'The canvas is the work and the wall is the room. The frame is the trouble.',
    dur: 4.2,
  },
  {
    p: 425, x: 28, wall: 1, art: 1,
    text: 'Kant had a word for it. A parergon is a thing beside the work, like drapery on a statue.',
    dur: 5.0,
  },
  {
    p: 169, x: 28, wall: 1, art: 1,
    text: 'A frame is not a part. The painting would be the same painting without one.',
    dur: 4.4,
  },
  {
    p: 161, x: 28, wall: 1, art: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap the one Kant meant.',
      explain: 'The frame. The canvas is plainly the work and the wall is plainly the room, so neither is puzzling. A parergon is the thing that will not settle into either box, and a frame is the clearest case there is.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 441, x: 88, wall: 1, art: 1,
    text: 'It is not simply outside either. A gilt frame and a steel one make the same canvas read differently.',
    dur: 5.0,
  },
  {
    p: 430, x: 88, wall: 1, art: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-41-1',
      text: 'Even what is called ornamentation does not belong internally to the complete representation of the object, but only externally, as a complement.',
      author: 'Immanuel Kant',
      philosopherId: 'immanuel-kant',
      work: 'Critique of Judgment',
      era: '1790',
      branchSlugs: ['aesthetics'],
    },
    dur: 5.0,
  },
  {
    p: 444, x: 88, wall: 1, art: 1,
    text: 'And the border keeps widening. The title, the wall card, the height, the museum itself.',
    dur: 4.8,
  },
  {
    p: 267, x: 88, wall: 1, art: 1, ring: 1,
    interact: {
      prompt: 'What is the frame, then?',
      sort: {
        chip: 'the frame',
        bins: [
          { id: 'room', label: 'the room', reads: 'furniture — a curator may swap it at will' },
          { id: 'work', label: 'the work', reads: 'part of the work, so reframing makes another' },
          { id: 'edge', label: 'neither', reads: 'a boundary, which is not on either side', correct: true },
        ],
      },
      explain: 'Neither. Put it inside and reframing becomes a new artwork, which nobody believes. Put it outside and you cannot say why gilt and steel change the reading. Marking a boundary is its job, and a boundary does not sit on one side of itself.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 437, x: 88, wall: 1, art: 1,
    summary: {
      title: 'The Edge',
      points: [
        'Kant called frames and drapery parerga',
        'They are neither in the work nor simply outside',
        'The border keeps widening — title, wall, museum',
        'A boundary cannot sit on one side of itself',
      ],
      closing: 'Next time something moves you in a gallery, ask how much of the effect was hung on the wall, and how much was the wall.',
    },
    dur: 4.6,
  },
];
