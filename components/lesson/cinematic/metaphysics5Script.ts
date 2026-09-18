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
  /** A dashed loop appears around the figure — the questioner is himself one of the beings being asked about (group AH). 0..1. */ included?: number;
  /** A small "?" appears at the tip of Leibniz's rule, asking what the reason could be (group AH). 0..1. */ psrQ?: number;
  /** A rule settles in beneath the tag as Heidegger formally names the being Dasein (group AH). 0..1. */ dName?: number;
}

export const BEATS: Meta5Beat[] = [
  {
    p: 462, stars: 0.7, q: 0,
    text: 'Leibniz asked why there is something rather than nothing. Martin Heidegger later called it the first of all questions.',
    dur: 3.6,
  },
  {
    p: 275, stars: 1, q: 1,
    text: 'Heidegger calls this the fundamental question of metaphysics. The question concerns beings as a whole, not why any one thing exists.',
    cite: 'The fundamental question',
    dur: 3.3,
  },
  {
    p: 275, stars: 1, q: 1, included: 1,
    text: 'It asks why there are any beings at all, the questioner included.',
    dur: 1.9,
  },
  {
    p: 384, stars: 1, q: 1, psr: 1,
    // The rule is drawn on stage in plain words — EVERY FACT NEEDS A REASON. Naming
    // it "the Principle of Sufficient Reason" over the top of that adds a term and
    // no meaning, and undoes the choice the scene already made (J7).
    text: 'Leibniz grounded the question in his principle of sufficient reason. It holds that every fact needs a reason.',
    cite: 'Leibniz, 1714',
    dur: 2.2,
  },
  {
    p: 404, stars: 1, q: 1, psr: 1, psrQ: 1,
    // The rule is drawn on stage in plain words — EVERY FACT NEEDS A REASON. Naming
    // it "the Principle of Sufficient Reason" over the top of that adds a term and
    // no meaning, and undoes the choice the scene already made (J7).
    text: 'If every fact needs a reason, the existence of anything at all needs one too. What could that reason be?',
    dur: 2.6,
  },
  {
    p: 129, stars: 1, q: 1, psr: 1,
    quote: {
      id: 'lq-metaphysics-being-5-1',
      text: 'Why are there beings at all instead of nothing? That is the question.',
      author: 'Martin Heidegger',
      philosopherId: 'martin-heidegger',
      work: 'Introduction to Metaphysics',
      era: '1935',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.4,
  },
  {
    p: 278, stars: 1, q: 0.4, psr: 1, dasein: 1,
    text: 'The questioner is also part of the question. You’re a being for whom your own being is an issue.',
    cite: 'Heidegger, Being and Time',
    dur: 2.3,
  },
  {
    p: 278, stars: 1, q: 0.4, psr: 1, dasein: 1, dName: 1,
    text: 'Heidegger calls such a being Dasein, German for “being-there”. It’s the being that can inquire into being itself.',
    dur: 2.7,
  },
  {
    p: 165, stars: 1, q: 0.4, psr: 1, dasein: 1,
    interact: {
      prompt: 'Which attitude does the question “why is there anything at all?” express?',
      sort: {
        chip: 'Leibniz’s question',
        bins: [
          { id: 'doubt', label: 'doubt', reads: 'doubt: whether your beliefs can be trusted' },
          { id: 'wonder', label: 'wonder', reads: 'wonder: that anything exists at all', correct: true },
          { id: 'measure', label: 'measurement', reads: 'measurement: how much exists, and where' },
        ],
      },
      // Was "the leap is Kierkegaard's, the absurd is Camus's" — a leftover list of
      // two options that no longer exist, naming two thinkers for nothing.
      explain: 'Wonder. The question expresses amazement that anything exists at all. Doubt, as in Descartes, asks whether your beliefs can be trusted, which is a question about knowledge. Measurement asks how much exists, not why anything does.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 160, stars: 1, q: 0.4, psr: 1, dasein: 1,
    interact: {
      prompt: 'What does the term Dasein say about your way of being?',
      cards: [
        { text: 'Already there, in a world', correct: true },
        { text: 'A mind apart from the world', correct: false },
      ],
      explain: 'Already there, in a world. Da means “there” and Sein means “being”. Heidegger calls this being-in-the-world, and rejects the picture of a mind standing apart from its world.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Question of Being',
      points: [
        'Leibniz: every fact, even existence, needs a reason',
        'Heidegger: the fundamental question of metaphysics',
        'Dasein: a being for whom being is an issue',
        'The question begins in wonder, not doubt',
      ],
      closing: 'As Dasein, you’re a being that can ask why anything exists at all.',
    },
    dur: 2.8,
  },
];
