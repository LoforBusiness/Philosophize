import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-18, "Where Do Numbers Live?"
// Theme: A ROW OF THINGS YOU CAN POINT AT, AND ONE ARROW WITH NOWHERE TO LAND.
//
// The question sounds like word-play until somebody makes you try to locate the
// thing, so the scene is that attempt. Four plinths, four arrows pointing down
// at what is on them, and the fourth arrow stops in mid-air with a gap under it.
// The gap is drawn, measured, and never explained away.
//
// The decoys in the graded question are the two objects people reach for when
// pressed — the apples and the chalk mark — because both are genuinely THERE and
// neither of them is the number. Naming why not is the lesson.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — four plinths, tap the one nothing can point at.
//     Concrete, immediate, and the wrong answers are all things the reader can
//     see, which is the point they are about to lose (H66).
//   · beat 7  two CARDS — the best objection to Platonism, answered honestly.
//     The correct card admits nobody has solved it, because pretending otherwise
//     on the hardest question in the lesson is how a reader learns to distrust
//     everything else in it.
// ─────────────────────────────────────────────────────────────────────────────

export interface Met18Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The four plinths and their labels, 0…1. */ shelf?: number;
  /** The arrows pointing down at each one, 0…1. */ aim?: number;
  /** The fourth arrow's gap, and its waver, 0…1. */ hang?: number;
  /** The other place, dashed, under the fourth plinth, 0…1. */ beyond?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Met18Beat[] = [
  {
    p: 25, x: 200, shelf: 1,
    text: 'Four things. Three of them are somewhere.',
    dur: 3.2,
  },
  {
    p: 2, x: 200, shelf: 1, aim: 1,
    text: 'Point at the apple and you have pointed at something. Same for the chair, same for the star.',
    dur: 4.4,
  },
  {
    p: 45, x: 132, shelf: 1, aim: 1, hang: 1,
    text: 'Now point at the number three. Not three apples. Not the mark chalked on a board. The number.',
    cite: 'The arrow hangs',
    dur: 4.6,
  },
  {
    p: 13, x: 132, shelf: 1, aim: 1, hang: 1,
    text: 'And yet it is true that three is prime, and it was true before anybody counted anything.',
    dur: 4.2,
  },
  {
    p: 4, x: 132, shelf: 1, aim: 1, hang: 1, live: 1,
    interact: {
      prompt: 'Tap the one nothing in the room can point at.',
      explain: 'The number three. You can point at three apples, or at a numeral chalked on a board. Neither of those is the number. One is fruit and one is a mark. What they have in common has no place in the room.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, shelf: 1, aim: 1, hang: 1, beyond: 1,
    text: 'Plato takes the obvious way out. It exists, and it does not live here.',
    cite: 'Platonism',
    dur: 4.0,
  },
  {
    p: 137, x: 268, shelf: 1, aim: 1, hang: 1, beyond: 1,
    quote: {
      id: 'lq-metaphysics-being-18-2',
      text: 'The mathematician cannot create things at will, any more than the geographer can; he too can only discover what is there and give it a name.',
      author: 'Gottlob Frege',
      work: 'The Foundations of Arithmetic',
      era: '1884',
      philosopherId: 'gottlob-frege',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.8,
  },
  {
    p: 41, x: 268, shelf: 1, aim: 1, hang: 1, beyond: 1,
    interact: {
      prompt: 'If numbers are real but nowhere, how could we know about them?',
      cards: [
        { text: 'Nobody has a good answer', correct: true },
        { text: 'By looking more carefully', correct: false },
      ],
      explain: 'Nobody has a good answer, and it is the strongest objection Platonism faces. Knowing something usually means it reached you somehow. An object outside space and time cannot send anything, so the nominalist asks how the contact is meant to work.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Thing With No Address',
      points: [
        'Numbers are not the marks, and not the things counted',
        'Platonism says they exist outside space and time',
        'Nominalism says only the marks and the things exist',
        'Neither side has an easy account of how we know them',
      ],
      closing: 'The arrow is still hanging there, and the arithmetic still works.',
    },
    dur: 3.4,
  },
];
