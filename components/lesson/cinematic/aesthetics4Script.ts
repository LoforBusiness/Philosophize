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
    text: 'In 1917, a plain urinal was entered as art. No carving, no painting — just a choice. So what makes something art?',
    dur: 3.6,
  },
  {
    a: 1, v: 10, test: 2,
    text: 'For ages there were two answers. Plato’s: art copies the world skilfully, and the Greek word for that is mimesis. Tolstoy’s: art puts a feeling into a form somebody else can pick up. Both assume a person made it.',
    cite: 'Two old answers',
    dur: 5.0,
  },
  {
    a: 36, v: 15, test: 2, signed: 1,
    text: 'Duchamp laid a urinal on its back, signed it "R. Mutt 1917," and submitted it. The committee suppressed it. An anonymous defense replied: it does not matter who made it — "He CHOSE it."',
    cite: 'The Richard Mutt Case, 1917',
    dur: 5.2,
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
    text: 'Fountain fits neither answer. It copies nothing and expresses nothing, and it still will not go away. Asking "but is that art?" is already philosophy, because it makes you say what you secretly think art is.',
    cite: 'The artworld confers',
    dur: 5.0,
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
      prompt: 'A urinal in a gallery is art. Does that make anything art if you call it art?',
      cards: [
        { text: 'No, it took the artworld', correct: true },
        { text: 'Yes, anything you call art', correct: false },
      ],
      explain: 'The trap: "anything goes." Danto and Dickie say it took theory, history, and the artworld — not a private label — to make the choice register as art.',
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
