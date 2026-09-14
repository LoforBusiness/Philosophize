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
    text: 'Consider four things, three of which have a location you can point to.',
    dur: 3.2,
  },
  {
    p: 443, x: 200, shelf: 1, aim: 1,
    text: 'The apple, the chair and the star each occupy a place in space and time. Each is a concrete object.',
    dur: 4.4,
  },
  {
    p: 159, x: 132, shelf: 1, aim: 1, hang: 1,
    text: 'The number three has no such place. It isn’t a group of three apples.',
    cite: 'No location',
    dur: 2.3,
  },
  {
    p: 159, x: 132, shelf: 1, aim: 1, hang: 1,
    text: 'Nor is it the numeral chalked on a board, which is only a sign for the number.',
    dur: 2.3,
  },
  {
    p: 383, x: 132, shelf: 1, aim: 1, hang: 1,
    text: 'Yet claims about three are true. Three is a prime number, and it was prime before anyone counted.',
    dur: 4.2,
  },
  {
    p: 165, x: 132, shelf: 1, aim: 1, hang: 1, live: 1,
    interact: {
      prompt: 'Which of these four things has no location in space?',
      explain: 'The number three. The apple, the chair and the star each have a location. Three apples or a chalked numeral would too, but neither is the number itself.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 402, x: 132, shelf: 1, aim: 1, hang: 1, beyond: 1,
    text: 'Platonism, after Plato, gives the obvious answer. On this view, numbers exist as abstract objects outside space and time.',
    cite: 'Platonism',
    dur: 4.0,
  },
  {
    p: 456, x: 268, shelf: 1, aim: 1, hang: 1, beyond: 1,
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
      prompt: 'How much causal contact can an object outside space and time have with you?',
      drag: {
        lo: 'NONE AT ALL',
        hi: 'AS MUCH AS A STONE',
        start: 1,
        zones: [
          { id: 'none', upto: 0.3, reads: 'an abstract object causes nothing in you', correct: true },
          { id: 'faint', upto: 0.72, reads: 'contact through a special mathematical intuition' },
          { id: 'full', upto: 1, reads: 'as much as a stone does' },
        ],
      },
      explain: 'An abstract object causes nothing in you. It emits no light and exerts no force. Paul Benacerraf argued that, on a causal theory of knowledge, this makes mathematical knowledge hard to explain.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Mathematical Platonism and Its Problem',
      points: [
        'Numbers are not the marks, and not the things counted',
        'Platonism says they exist outside space and time',
        'Nominalism denies that abstract objects exist',
        'Platonism must explain how causally inert objects are known',
      ],
      closing: 'The nominalist Hartry Field holds that arithmetic is strictly false but still useful.',
    },
    dur: 3.4,
  },
];
