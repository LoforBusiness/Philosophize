import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-28, "Beauty Beyond the Gallery"
// Theme: A GALLERY AND A STREET, AND WHICH OF THEM THE LIGHT IS IN.
//
// The whole question is about WHERE aesthetic experience happens, so the stage
// draws two places side by side and lights them. Nothing has to be said about
// which room is better: a reader looking at a dark street and a lit gallery can
// see the claim being made.
//
// The framed picture on the gallery wall is drawn at a size the street's cup and
// ball cannot match, and it keeps that size — until the third answer, where it
// shrinks to a cup. That is the critic's objection drawn rather than reported.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what everyday
//     aesthetics actually claims. On the stage because both rooms are standing
//     there and the answer is a statement about which one the light is in.
//   · beat 8  a SORT — one perfect coffee, dropped into where it belongs. The
//     lights answer, and the overreaching bin flattens the painting to a cup.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics28Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the gallery and the street are drawn. */ rooms?: number;
  /** How lit the gallery is, 0…1. */ lit?: number;
  /** How lit the street is, 0…1. */ street?: number;
  /** How far the framed work has shrunk toward a cup, 0…1. */ flat?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Aesthetics28Beat[] = [
  {
    p: 429, x: 26, rooms: 1, lit: 1,
    text: 'You haven’t been to a museum in months. You’ve had aesthetic experiences all week.',
    dur: 5.0,
  },
  {
    p: 177, x: 26, rooms: 1, lit: 1,
    text: 'The smell of rain. A tidy desk, and the arc of a pass nobody expected.',
    dur: 4.6,
  },
  {
    p: 441, x: 26, rooms: 1, lit: 1, street: 1,
    text: 'For centuries aesthetics meant paintings, symphonies and poems. Most of a life happens elsewhere.',
    dur: 5.0,
  },
  {
    p: 264, x: 26, rooms: 1, lit: 1, street: 1,
    text: 'Cooking, dressing, tidying, commuting. Yuriko Saito argues these hours deserve the same attention.',
    dur: 5.0,
  },
  {
    p: 160, x: 26, rooms: 1, lit: 1, street: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what everyday aesthetics claims.',
      explain: 'Most beauty is outside art. Saito and others point at cooking, tidying and commuting, where nearly all of a life is spent. Nothing here runs art down, and taste is not the same as attention.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 457, x: 82, rooms: 1, lit: 1, street: 1,
    text: 'A footballer threads a pass nobody expected, and the stadium gasps. Grace, timing, form that fits its purpose.',
    dur: 5.0,
  },
  {
    p: 436, x: 82, rooms: 1, lit: 1, street: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-28-1',
      text: 'The aesthetic quality of our everyday life has a direct and lasting impact on our quality of life.',
      author: 'Yuriko Saito',
      work: 'Everyday Aesthetics',
      era: '2007',
      branchSlugs: ['aesthetics'],
    },
    dur: 5.0,
  },
  {
    p: 453, x: 82, rooms: 1, lit: 1, street: 1,
    text: 'A critic objects. If a tidy drawer and a Rembrandt are both aesthetic, the word has stopped working.',
    dur: 5.0,
  },
  {
    p: 171, x: 82, rooms: 1,
    interact: {
      prompt: 'Where does aesthetic experience actually happen?',
      sort: {
        chip: 'a perfect coffee',
        bins: [
          { id: 'art', label: 'only in art', reads: 'the gallery keeps beauty to itself' },
          { id: 'both', label: 'in the ordinary too', reads: 'form and balance, noticed off the wall', correct: true },
          { id: 'same', label: 'all of it equal', reads: 'a sandwich now rivals a Rembrandt' },
        ],
      },
      explain: 'In the ordinary too. You look at a dish for its balance and the way it’s set out. That’s aesthetic looking, whatever the room. Saying a sandwich rivals a Rembrandt goes too far the other way.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 318, x: 82, rooms: 1, lit: 1, street: 1,
    summary: {
      title: 'Beauty Off the Wall',
      points: [
        'Most aesthetic experience happens outside art',
        'Food, sport and cities invite real appreciation',
        'Enriching daily life does not cheapen a Rembrandt',
        'Saito: daily beauty shapes the quality of a life',
      ],
      closing: 'The next perfect cup of coffee is an aesthetic experience, if you let yourself notice it.',
    },
    dur: 5.0,
  },
];
