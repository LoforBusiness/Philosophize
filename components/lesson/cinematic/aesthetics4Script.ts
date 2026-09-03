import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-4, "Can Anything Be Art?" — Duchamp's Fountain.
//
// The stage is a gallery AND a scorecard. A readymade sits on a plinth between
// the artist (who signs it) and a viewer (who recoils, then thinks). Above them,
// THREE TESTS FOR ART are pinned up as cards: mimesis, expression, artworld. As
// the lesson lands, each card is marked — a cross for the two old theories the
// urinal defeats, a tick for the one that explains it.
//
// Prop channels the scene reads: `ask` (the wall card that poses the question on
// the hook, in the slot the theory cards then take), `test` (how many theory cards
// are pinned up), `verdict` (the marks against them), `signed` (R. Mutt on the
// readymade) and `art` (the placard the artworld confers).
//
// Graded questions are the two from data/.../can-anything-be-art.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes4Beat extends BaseBeat {
  /** Artist gesture. */ a?: number;
  /** Viewer gesture. */ v?: number;
  /** The "IS THIS ART?" wall card, which the theory cards replace (0/1). */ ask?: number;
  /** How many theory cards are pinned up (0..3). */ test?: number;
  /** The cross/cross/tick marks are struck onto the cards (0/1). */ verdict?: number;
  /** Signature on the readymade (0/1). */ signed?: number;
  /** The artworld's ART placard (0/1). */ art?: number;
}

export const BEATS: Aes4Beat[] = [
  {
    a: 2, v: 0, ask: 1, test: 0, verdict: 0, signed: 0, art: 0,
    text: 'In 1917, a plain urinal was entered as art. No carving, no painting — just a choice.',
    dur: 2.8,
  },
  {
    a: 2, v: 0, ask: 1, test: 0, verdict: 0, signed: 0, art: 0,
    text: 'So what makes something art?',
    dur: 1.8,
  },
  {
    a: 167, v: 10, test: 2,
    text: 'For ages there were two answers. Plato’s: art copies the world skilfully, and the Greek word for that is mimesis.',
    cite: 'Two old answers',
    dur: 2.6,
  },
  {
    a: 167, v: 10, test: 2,
    text: 'Tolstoy’s: art puts a feeling into a form somebody else can pick up. Both assume a person made it.',
    dur: 2.4,
  },
  {
    a: 36, v: 15, test: 2, signed: 1,
    text: 'Duchamp laid a urinal on its back, signed it R. Mutt 1917, and sent the thing in.',
    cite: 'The Richard Mutt Case, 1917',
    dur: 2.2,
  },
  {
    a: 36, v: 15, test: 2, signed: 1,
    text: 'The committee hid the piece. An unsigned defence replied that the maker did not matter.',
    dur: 1.9,
  },
  {
    a: 36, v: 15, test: 2, signed: 1,
    text: 'Duchamp chose the object, and choosing was the work.',
    dur: 1.8,
  },
  {
    a: 0, v: 4, test: 2, signed: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-4-1',
      text: 'To see something as art requires something the eye cannot descry — an atmosphere of artistic theory, a knowledge of the history of art: an artworld.',
      author: 'Arthur Danto',
      work: 'The Artworld',
      era: '1964',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    a: 13, v: 4, test: 3, verdict: 1, signed: 1, art: 1,
    text: 'Fountain fits neither answer. It copies nothing and expresses nothing, and it still will not go away.',
    cite: 'The artworld confers',
    dur: 2.4,
  },
  {
    a: 400, v: 4, test: 3, verdict: 1, signed: 1, art: 1,
    text: 'Asking "but is that art? is already philosophy, because it makes you say what you secretly think art is.',
    dur: 2.6,
  },
  {
    a: 21, v: 4, test: 3, verdict: 1, signed: 1, art: 1,
    interact: {
      prompt: 'So where does the art actually live — in the object, or in the room around it?',
      cards: [
        { text: 'The artworld confers the status', correct: true },
        { text: 'Something in the object', correct: false },
      ],
      explain: 'George Dickie’s answer is the room. Galleries, critics and a tradition hand the object its status, and the object contributes nothing. A chosen urinal becomes art, and an identical one in a shop stays plumbing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    a: 0, v: 8, test: 3, verdict: 1, signed: 1, art: 1,
    interact: {
      prompt: 'Set the lever to what it takes to make a chosen object art.',
      lever: {
        start: 0,
        stops: [
          { id: 'label', reads: 'anything, if you say the word' },
          { id: 'skill', reads: 'only what took real skill to make' },
          { id: 'world', reads: 'the art world taking it up', correct: true },
        ],
      },
      explain: 'The far setting. The first is the anything goes reading and it is not what Dickie or Danto said. It took theory, history and an artworld for the choice to register at all — which is why the identical urinal in a plumbing shop stayed plumbing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Art Became a Question',
      points: [
        'Old theories: mimesis, or expression',
        'Duchamp: choice and context, not craft',
        'Danto and Dickie: the artworld confers art',
      ],
      closing: 'Duchamp’s urinal mattered most for the question it forced.',
    },
    dur: 2.8,
  },
];
