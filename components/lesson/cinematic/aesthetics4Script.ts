import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-4, "Can Anything Be Art?" — Duchamp's Fountain.
// A plain readymade sits on a gallery plinth. The artist signs it "R. Mutt 1917";
// a viewer recoils, then falls into thought; an ART placard is conferred by the
// artworld. Plinth centre (below head height), artist left, viewer right — the
// figures flank the pedestal and never cover it.
//
// Graded questions are the two from data/.../can-anything-be-art.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes4Beat extends BaseBeat {
  /** Artist gesture. */ a?: number;
  /** Viewer gesture. */ v?: number;
  /** Signature on the readymade (0/1). */ signed?: number;
  /** The artworld's ART placard (0/1). */ art?: number;
}

export const BEATS: Aes4Beat[] = [
  {
    a: 2, v: 0, signed: 0, art: 0,
    text: 'In 1917, a plain urinal was entered as art. No carving, no painting — just a choice. So what makes something art?',
    dur: 3.6,
  },
  {
    a: 1, v: 10,
    text: 'For ages, two ideas ruled. Plato and Aristotle: art is mimesis, skilled imitation. Later Tolstoy and Collingwood: art is the expression of feeling. Both assume a maker’s craft.',
    cite: 'Two old answers',
    dur: 5.0,
  },
  {
    a: 36, v: 15, signed: 1,
    text: 'Duchamp laid a urinal on its back, signed it "R. Mutt 1917," and submitted it. The committee suppressed it. An anonymous defense replied: it does not matter who made it — "He CHOSE it."',
    cite: 'The Richard Mutt Case, 1917',
    dur: 5.2,
  },
  {
    a: 0, v: 4, signed: 1,
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
    a: 13, v: 4, signed: 1, art: 1,
    text: 'Fountain defies mimesis and expression alike — it stirs a question more than a feeling. Asking "but is this art?" is itself philosophy: it drags your hidden definition into the open.',
    cite: 'The artworld confers',
    dur: 5.0,
  },
  {
    a: 21, v: 4, signed: 1, art: 1,
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
    a: 0, v: 8, signed: 1, art: 1,
    mc: {
      prompt: 'A urinal becomes art in a gallery. So does that prove "anything is art if you call it art"?',
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
