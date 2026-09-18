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
  /** 1 = a WORK tag marks the canvas and a ROOM tag marks the wall, as settled. */ settle?: number;
  /** 1 = a PARERGON tag pins onto the frame band itself. */ parergon?: number;
  /** 1 = the frame band dims, as if lifted away, while the canvas stays as it is. */ ghost?: number;
  /** 1 = a dashed line grows from the frame's edge outward across the wall. */ spread?: number;
}

export const BEATS: Aesthetics41Beat[] = [
  {
    p: 423, x: 28, wall: 1, art: 1,
    text: 'Suppose you point at the edge of a painting. Is your finger on the painting or off it?',
    dur: 4.4,
  },
  {
    p: 262, x: 28, wall: 1, art: 1, settle: 1,
    text: 'The canvas belongs to the work, and the wall belongs to the room. The frame is the difficult case.',
    dur: 4.2,
  },
  {
    p: 425, x: 28, wall: 1, art: 1, settle: 1, parergon: 1,
    text: 'Immanuel Kant called such things parerga, things beside the work. Frames on pictures and the clothing on statues are his examples.',
    dur: 5.0,
  },
  {
    p: 169, x: 28, wall: 1, art: 1, settle: 1, parergon: 1, ghost: 1,
    text: 'A frame is not part of the painting. The painting would be the same painting without one.',
    dur: 4.4,
  },
  {
    p: 161, x: 28, wall: 1, art: 1, plates: 1, live: 1, settle: 1, parergon: 1,
    interact: {
      prompt: 'Which of the three is Kant’s example of a parergon?',
      explain: 'The frame. The canvas is the work and the wall is part of the room, so neither is puzzling. A parergon sits at the border between the work and its surroundings, and a frame is Kant’s own example.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 441, x: 88, wall: 1, art: 1, settle: 1, parergon: 1,
    text: 'The frame is not outside the work either. A gilt frame and a steel frame change how the same canvas is seen.',
    dur: 5.0,
  },
  {
    p: 430, x: 88, wall: 1, art: 1, settle: 1, parergon: 1,
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
    p: 444, x: 88, wall: 1, art: 1, settle: 1, parergon: 1, spread: 1,
    text: 'The boundary problem extends outward, to the title, the wall label, the hanging height and the museum itself.',
    dur: 4.8,
  },
  {
    p: 267, x: 88, wall: 1, art: 1, ring: 1, settle: 1, parergon: 1, spread: 1,
    interact: {
      prompt: 'Does the frame belong to the work, to the room, or to neither?',
      sort: {
        chip: 'the frame',
        bins: [
          { id: 'room', label: 'the room', reads: 'furniture that a curator may replace freely' },
          { id: 'work', label: 'the work', reads: 'part of the work, so reframing creates another' },
          { id: 'edge', label: 'neither', reads: 'a boundary, belonging to neither side', correct: true },
        ],
      },
      explain: 'The frame belongs to neither. If it were inside the work, reframing would create a new artwork, which seems false. If it were outside, gilt and steel frames couldn’t change how the canvas is seen. Jacques Derrida argues that the parergon is neither inside nor outside the work.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 437, x: 88, wall: 1, art: 1, settle: 1, parergon: 1, spread: 1,
    summary: {
      title: 'Where the Work Ends',
      points: [
        'Kant called frames and drapery parerga',
        'They are neither in the work nor simply outside',
        'The same question arises for titles, labels and museums',
        'A boundary belongs to neither of the sides it divides',
      ],
      closing: 'The effect of a work in a gallery can depend on its frame, label and setting. Where the work itself ends remains disputed.',
    },
    dur: 4.6,
  },
];
