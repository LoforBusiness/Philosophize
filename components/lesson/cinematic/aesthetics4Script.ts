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
    text: 'For ages, two ideas ruled. Plato and Aristotle: art is mimesis, skilled imitation. Later Tolstoy and Collingwood: art is the expression of feeling. Both assume a maker’s craft.',
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
    text: 'Fountain defies mimesis and expression alike — it stirs a question more than a feeling. Asking "but is this art?" is itself philosophy: it drags your hidden definition into the open.',
    cite: 'The artworld confers',
    dur: 5.0,
  },
  {
    a: 21, v: 4, test: 3, verdict: 1, signed: 1, art: 1,
    mc: {
      prompt: 'On Dickie’s institutional theory, what makes something count as art?',
      options: [
        { id: 'a', text: 'The artworld’s institutions conferring the status of art', correct: true },
        { id: 'b', text: 'Being crafted with rare technical skill', correct: false },
        { id: 'c', text: 'Expressing a powerful emotion to viewers', correct: false },
        { id: 'd', text: 'Faithfully imitating something in nature', correct: false },
      ],
      explain:
        'For Dickie, status is conferred by galleries, critics, and traditions — not the object. A chosen urinal becomes art; an identical one in a shop stays plumbing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    a: 0, v: 8, test: 3, verdict: 1, signed: 1, art: 1,
    mc: {
      prompt: 'A urinal in a gallery is art. Does that make anything art if you call it art?',
      options: [
        { id: 'a', text: 'Yes — a personal label is all it takes', correct: false },
        { id: 'b', text: 'No — it took the artworld’s context, not one person’s say-so', correct: true },
        { id: 'c', text: 'No — the urinal was secretly beautiful after all', correct: false },
        { id: 'd', text: 'Yes — Duchamp proved craft and skill are meaningless', correct: false },
      ],
      explain:
        'The trap: "anything goes." Danto and Dickie say it took theory, history, and the artworld — not a private label — to make the choice register as art.',
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
