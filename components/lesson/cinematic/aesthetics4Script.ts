import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-4, "Can Anything Be Art?" — Duchamp's Fountain.
// Theme: A STUDIO, A FACTORY-MADE URINAL, AND THE EXHIBITION HALL IT WAS REFUSED FROM.
//
// In a studio he pulls a cloth off a factory-made urinal standing on the work table:
// not carved, not painted, only chosen. Two easels hold the older answers, a painted
// apple beside a real one (imitation) and a painting of a feeling (expression). He
// turns the urinal onto its back and signs it R. MUTT 1917. The camera goes into it
// and comes out of the same urinal on a plinth in an exhibition hall: a screen is slid
// in front of it and REFUSED is stamped on the screen; then the screen goes, a spotlight
// comes on, its plate reads FOUNTAIN, and a banner for the artworld unrolls over the hall.
//
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts). Every line, citation, quotation and summary point is copied from
// the previous script by a generator, word for word and beat for beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes4Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 232 by the work table in the studio · 250 by the plinth in the hall. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'unveil' | 'ask' | 'mimesis' | 'express' | 'sign' | 'enter' | 'title' | 'artworld' | 'ponder';
  /** The cloth is off the urinal. */ bare?: boolean;
  /** ART? stands over it. */ ask?: boolean;
  /** MIMESIS is over the first easel. */ mim?: boolean;
  /** EXPRESSION is over the second easel. */ exp?: boolean;
  /** It is on its back and signed: R. MUTT 1917. */ signed?: boolean;
  /** He is in the exhibition hall, not the studio (the scene change is the beat that sets it). */ hall?: boolean;
  /** The screen is in front of it: REFUSED. */ refused?: boolean;
  /** The screen is gone, the spotlight is on it, and its plate reads FOUNTAIN. */ titled?: boolean;
  /** The banner for the artworld is unrolled over the hall. */ art?: boolean;
  /** This beat's camera tour, over the generated one (K10); [] holds the whole set, which the scene change needs. */ tour?: readonly (readonly number[])[];
}

export const BEATS: Aes4Beat[] = [
  {
    p: 158, x: 232, act: 'unveil', bare: true,
    text: 'In 1917, a mass-produced urinal was submitted to an art exhibition. It wasn’t carved or painted, only chosen.',
    dur: 2.8,
  },
  {
    p: 167, x: 232, act: 'ask', bare: true, ask: true,
    text: 'The case raises a question of definition. What makes any object a work of art?',
    dur: 1.8,
  },
  {
    p: 158, x: 232, act: 'mimesis', bare: true, ask: true, mim: true,
    text: 'Two older theories answer it. The first, from Plato and Aristotle, holds that art is skilled imitation, or mimesis.',
    cite: 'Two older theories',
    dur: 2.6,
  },
  {
    p: 158, x: 232, act: 'express', bare: true, ask: true, mim: true, exp: true,
    text: 'The second, from Tolstoy, holds that art expresses a feeling and conveys it to an audience. Both theories assume someone made the work.',
    dur: 2.4,
  },
  {
    p: 158, x: 232, act: 'sign', bare: true, ask: true, mim: true, exp: true, signed: true,
    text: 'Marcel Duchamp turned the urinal on its back, signed it with the name “R. Mutt 1917”, and titled the work Fountain.',
    cite: 'The Richard Mutt Case, 1917',
    dur: 2.2,
  },
  {
    p: 158, x: 250, act: 'enter', bare: true, ask: true, mim: true, exp: true, signed: true, hall: true, refused: true, tour: [],
    text: 'The exhibition’s board refused to display the work. An unsigned defence argued that whether Mutt made it with his own hands had no importance.',
    dur: 1.9,
  },
  {
    p: 158, x: 250, act: 'title', bare: true, ask: true, mim: true, exp: true, signed: true, hall: true, titled: true,
    text: 'The defence held that choosing was the artistic act. Placed under a new title, the object lost its everyday use.',
    dur: 1.8,
  },
  {
    p: 263, x: 250, bare: true, ask: true, mim: true, exp: true, signed: true, hall: true, titled: true,
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
    p: 158, x: 250, act: 'artworld', bare: true, ask: true, mim: true, exp: true, signed: true, hall: true, titled: true, art: true,
    text: 'Fountain copies nothing and expresses no feeling, so neither theory fits. For George Dickie, the institutions of the artworld make it art.',
    cite: 'The artworld confers',
    dur: 2.4,
  },
  {
    p: 167, x: 250, act: 'ponder', bare: true, ask: true, mim: true, exp: true, signed: true, hall: true, titled: true, art: true,
    text: 'Asking whether something is art is philosophical. It forces you to state the definition you privately hold.',
    dur: 2.6,
  },
  {
    p: 260, x: 250, bare: true, ask: true, mim: true, exp: true, signed: true, hall: true, titled: true, art: true,
    interact: {
      prompt: 'If an identical urinal in a shop isn’t art, what makes Fountain art?',
      cards: [
        { text: 'The artworld confers the status', correct: true },
        { text: 'A property of the object', correct: false },
      ],
      explain: 'The artworld confers the status. George Dickie’s institutional theory holds that someone acting for the artworld confers art status on an object. A property of the object can’t be the answer. An identical urinal in a shop has the same properties and isn’t art.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 250, bare: true, ask: true, mim: true, exp: true, signed: true, hall: true, titled: true, art: true,
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
    dur: 1,
  },
  {
    bare: true, ask: true, mim: true, exp: true, signed: true, hall: true, titled: true, art: true,
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
