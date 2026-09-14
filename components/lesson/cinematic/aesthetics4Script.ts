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
    text: 'In 1917, a mass-produced urinal was submitted to an art exhibition. It wasn’t carved or painted, only chosen.',
    dur: 2.8,
  },
  {
    a: 2, v: 0, ask: 1, test: 0, verdict: 0, signed: 0, art: 0,
    text: 'The case raises a question of definition. What makes any object a work of art?',
    dur: 1.8,
  },
  {
    a: 167, v: 10, test: 2,
    text: 'Two older theories answer it. The first, from Plato and Aristotle, holds that art is skilled imitation, or mimesis.',
    cite: 'Two older theories',
    dur: 2.6,
  },
  {
    a: 167, v: 10, test: 2,
    text: 'The second, from Tolstoy, holds that art expresses a feeling and conveys it to an audience. Both theories assume someone made the work.',
    dur: 2.4,
  },
  {
    a: 36, v: 15, test: 2, signed: 1,
    text: 'Marcel Duchamp turned the urinal on its back, signed it with the name “R. Mutt 1917”, and titled the work Fountain.',
    cite: 'The Richard Mutt Case, 1917',
    dur: 2.2,
  },
  {
    a: 36, v: 15, test: 2, signed: 1,
    text: 'The exhibition’s board refused to display the work. An unsigned defence argued that whether Mutt made it with his own hands had no importance.',
    dur: 1.9,
  },
  {
    a: 36, v: 15, test: 2, signed: 1,
    text: 'The defence held that choosing was the artistic act. Placed under a new title, the object lost its everyday use.',
    dur: 1.8,
  },
  {
    a: 158, v: 4, test: 2, signed: 1,
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
    a: 383, v: 4, test: 3, verdict: 1, signed: 1, art: 1,
    text: 'Fountain copies nothing and expresses no feeling, so neither theory fits. For George Dickie, the institutions of the artworld make it art.',
    cite: 'The artworld confers',
    dur: 2.4,
  },
  {
    a: 400, v: 4, test: 3, verdict: 1, signed: 1, art: 1,
    text: 'Asking whether something is art is philosophical. It forces you to state the definition you privately hold.',
    dur: 2.6,
  },
  {
    a: 380, v: 4, test: 3, verdict: 1, signed: 1, art: 1,
    interact: {
      prompt: 'If an identical urinal in a shop isn’t art, what makes Fountain art?',
      cards: [
        { text: 'The artworld confers the status', correct: true },
        { text: 'A property of the object', correct: false },
      ],
      explain: 'The artworld confers the status. George Dickie’s institutional theory holds that someone acting for the artworld confers art status on an object. A property of the object can’t be the answer. An identical urinal in a shop has the same properties and isn’t art.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    a: 462, v: 8, test: 3, verdict: 1, signed: 1, art: 1,
    interact: {
      prompt: 'What turns a chosen object into art?',
      sort: {
        chip: 'a chosen object',
        bins: [
          { id: 'label', label: 'saying so', reads: 'whatever anyone declares to be art' },
          { id: 'skill', label: 'skilled craft', reads: 'only what took skill to make' },
          { id: 'world', label: 'the artworld', reads: 'recognition by the artworld', correct: true },
        ],
      },
      explain: 'The artworld. For Arthur Danto, an object becomes art only against an atmosphere of theory and art history. A declaration alone isn’t enough on this view. Skill isn’t required either, since Fountain involved none.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Fountain and the Definition of Art',
      points: [
        'Older theories: art as imitation or expression',
        'Duchamp: choice and context, not craft',
        'Danto and Dickie: art status depends on the artworld',
      ],
      closing: 'Fountain matters less as an object than for the question it raised about what art is.',
    },
    dur: 2.8,
  },
];
