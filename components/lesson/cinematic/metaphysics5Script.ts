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
    text: 'Heidegger called this the fundamental question of metaphysics. Not why this thing or that thing exists. Why there is anything at all to ask about.',
    cite: 'The fundamental question',
    dur: 5.2,
  },
  {
    p: 19, stars: 1, q: 1, psr: 1,
    // The rule is drawn on stage in plain words — EVERY FACT NEEDS A REASON. Naming
    // it "the Principle of Sufficient Reason" over the top of that adds a term and
    // no meaning, and undoes the choice the scene already made (J7).
    text: 'Leibniz pressed it hardest. Nothing is just true for no reason, he said. Every fact has one somewhere — so what is the reason for there being anything?',
    cite: 'Leibniz, 1714',
    dur: 4.8,
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
    p: 20, stars: 1, q: 0.4, psr: 1, dasein: 1,
    text: 'And here is the strange part. You are a thing that wonders what it is. Heidegger’s name for that is Dasein, and through you the universe turns round and asks about itself.',
    cite: 'Dasein — being-there',
    dur: 5.0,
  },
  {
    p: 4, stars: 1, q: 0.4, psr: 1, dasein: 1,
    interact: {
      prompt: 'Set the lever to where Heidegger says this question starts.',
      lever: {
        start: 0,
        stops: [
          { id: 'doubt', reads: 'doubt: can I trust anything I see?' },
          { id: 'wonder', reads: 'wonder: why is any of this here at all?', correct: true },
          { id: 'measure', reads: 'measurement: what is here, and how much of it?' },
        ],
      },
      // Was "the leap is Kierkegaard's, the absurd is Camus's" — a leftover list of
      // two options that no longer exist, naming two thinkers for nothing.
      explain: 'The middle setting. Amazement that there is anything, rather than suspicion about what you are looking at. Doubt is Descartes at the first setting, and it asks something else entirely: not whether the world is here, but whether your eyes are telling the truth about it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, stars: 1, q: 0.4, psr: 1, dasein: 1,
    interact: {
      prompt: 'Heidegger picked that word deliberately. Tap what it says about you.',
      cards: [
        { text: 'Being-there', correct: true },
        { text: 'Decision', correct: false },
      ],
      explain: 'Da means there and Sein means being. Being-there. It is deliberately plain: you are not a soul visiting a world, you are something already in the middle of one.',
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
      closing: 'You belong to a universe that can ask why there is anything. So go ahead and ask.',
    },
    dur: 2.8,
  },
];
