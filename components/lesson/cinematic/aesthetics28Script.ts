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
    text: 'Suppose you haven’t visited a museum in months. You may still have had aesthetic experiences every day this week.',
    dur: 5.0,
  },
  {
    p: 177, x: 26, rooms: 1, lit: 1,
    text: 'Examples include the smell of rain, a well-ordered desk and an unexpected pass in a football match.',
    dur: 4.6,
  },
  {
    p: 441, x: 26, rooms: 1, lit: 1, street: 1,
    text: 'For centuries, aesthetics studied mainly the fine arts, such as painting, music and poetry. Most of a life happens elsewhere.',
    dur: 5.0,
  },
  {
    p: 264, x: 26, rooms: 1, lit: 1, street: 1,
    text: 'Yuriko Saito argues that cooking, dressing, cleaning and commuting deserve aesthetic attention too. This field is called everyday aesthetics.',
    dur: 5.0,
  },
  {
    p: 160, x: 26, rooms: 1, lit: 1, street: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Which of these claims is everyday aesthetics committed to?',
      explain: 'Most beauty is outside art. Saito points to cooking, cleaning and commuting, which fill most of a life. The view doesn’t claim that art is overrated, and it concerns attention rather than taste.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 457, x: 82, rooms: 1, lit: 1, street: 1,
    text: 'A footballer makes a pass nobody expected, and the stadium gasps. The pass has grace, good timing and a form suited to its purpose.',
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
    text: 'The view faces an objection. If a tidy drawer and a Rembrandt are both aesthetic, the word marks nothing special.',
    dur: 5.0,
  },
  {
    p: 171, x: 82, rooms: 1,
    interact: {
      prompt: 'Which view of aesthetic experience fits a perfect cup of coffee?',
      sort: {
        chip: 'a perfect coffee',
        bins: [
          { id: 'art', label: 'only in art', reads: 'aesthetic value belongs to art alone' },
          { id: 'both', label: 'ordinary things too', reads: 'ordinary things can be appreciated for their form', correct: true },
          { id: 'same', label: 'everything equal', reads: 'a sandwich has as much value as a Rembrandt' },
        ],
      },
      explain: 'Ordinary things too. A coffee noticed for its balance and look is an object of aesthetic attention. A sandwich doesn’t rival a Rembrandt, but beauty isn’t only in art.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 318, x: 82, rooms: 1, lit: 1, street: 1,
    summary: {
      title: 'Everyday Aesthetics',
      points: [
        'Most aesthetic experience happens outside art',
        'Food, sport and cities invite genuine aesthetic appreciation',
        'Valuing daily life need not lower the value of art',
        'Saito: daily beauty shapes the quality of a life',
      ],
      closing: 'Aesthetic experience depends on attention to form, and ordinary things can receive that attention.',
    },
    dur: 5.0,
  },
];
