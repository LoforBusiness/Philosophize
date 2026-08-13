import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-5, "The Mystery of Existence". A lone figure under a
// vast field of stars, a great ? hanging in the sky — "why is there something rather
// than nothing?" Then the figure itself glows: Dasein, the being through whom
// existence turns and questions itself. Questions A/B/C/D.

export interface Meta5Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** Starfield brightness inside the SOMETHING panel 0..1. */ stars?: number;
  /** The great "?" standing between NOTHING and SOMETHING 0..1. */ q?: number;
  /** The figure glows and the DASEIN tag stamps in 0..1. */ dasein?: number;
  /** Leibniz's principle of sufficient reason, ruled under the panels 0..1. */ psr?: number;
}

export const BEATS: Meta5Beat[] = [
  {
    p: 25, stars: 0.7, q: 0,
    text: 'There is something rather than nothing. Why? Leibniz framed the question; Heidegger called it the first one of all.',
    dur: 3.6,
  },
  {
    p: 24, stars: 1, q: 1,
    text: 'Heidegger’s "fundamental question of metaphysics": why are there beings at all instead of nothing? Not why this or that exists — but why anything does. The jolt of noticing it is wonder.',
    cite: 'The fundamental question',
    dur: 5.2,
  },
  {
    p: 19, stars: 1, q: 1, psr: 1,
    text: 'In 1714 Leibniz pressed it hardest. His Principle of Sufficient Reason says every fact needs a reason. So existence itself must demand one.',
    cite: 'Leibniz, 1714',
    dur: 4.8,
  },
  {
    p: 129, stars: 1, q: 1, psr: 1,
    quote: {
      id: 'lq-metaphysics-being-5-1',
      text: 'Why are there beings at all instead of nothing? That is the question.',
      author: 'Martin Heidegger',
      work: 'Introduction to Metaphysics',
      era: '1935',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.4,
  },
  {
    p: 20, stars: 1, q: 0.4, psr: 1, dasein: 1,
    text: 'And here is what is strangest about us: we are the beings whose own being is at issue. Heidegger calls this "Dasein." Through you, existence turns around and questions itself.',
    cite: 'Dasein — being-there',
    dur: 5.0,
  },
  {
    p: 4, stars: 1, q: 0.4, psr: 1, dasein: 1,
    interact: {
      prompt: 'For Heidegger, which mood throws open the question of why anything exists at all?',
      cards: [
        { text: 'Wonder at Being', correct: true },
        { text: 'Cartesian doubt', correct: false },
      ],
      explain: 'Wonder — astonishment that anything is at all — opens the fundamental question. Doubt is Descartes’s, the leap is Kierkegaard’s, the absurd is Camus’s.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, stars: 1, q: 0.4, psr: 1, dasein: 1,
    interact: {
      prompt: '"Dasein" is German. Which translation is the one Heidegger actually means?',
      cards: [
        { text: 'Being-there', correct: true },
        { text: 'Decision', correct: false },
      ],
      explain: '"Dasein" splits into Da (there) and Sein (being): "being-there." The look-alikes are traps — it names human existence, the being for whom being is a question.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Existence Is Worth Wondering About',
      points: [
        'Leibniz: why something rather than nothing?',
        'Heidegger: the fundamental question',
        'Dasein: a being whose being is in question',
        'Wonder is where metaphysics catches fire',
      ],
      closing: 'You belong to a universe that can ask why it exists — so go ahead and ask.',
    },
    dur: 2.8,
  },
];
