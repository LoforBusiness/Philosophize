import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-9, "What Is Truth, Anyway?" — the correspondence
// theory taught with a MAP and the LAND it claims to describe. The figure WALKS
// between the easel (the map = a belief) and the viewpoint (the land = the world),
// looking from one to the other. Q1 is answered in the scene: two candidate maps go
// up and you tap the true one. Q2 is A/B/C/D and springs the real trap — you cannot
// step outside your beliefs to do the checking.
//
// Plain language throughout, and the theories are NAMED only after the reader has
// already used them: you pick the true map before anyone says "correspondence", and
// you hit the checking problem before coherence and pragmatism are offered as
// answers to it.

export interface Epistemology9Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 148 = at the easel · 208 = mid · 268 = the viewpoint. */ x?: number;
  /** 1 = the real landscape (two hills + a tree) is on the horizon. */ land?: number;
  /** 1 = the sketched map is drawn on the easel board. */ map?: number;
  /** 1 = the two candidate maps are pinned up for Q1. */ cards?: number;
  /** 1 = the "how do you check?" arrows + ? badge sit between map and land. */ link?: number;
  /** Rival theories placarded on the right: 0 none · 1 coherence · 2 + pragmatism. */ theory?: number;
}

export const BEATS: Epistemology9Beat[] = [
  {
    p: 164, x: 208,
    text: 'Truth is something people value. Yet it’s hard to say what makes a belief true.',
    dur: 2.2,
  },
  {
    p: 164, x: 208,
    text: 'When you call a statement true, what are you claiming about it?',
    dur: 1.8,
  },
  {
    p: 34, x: 268, land: 1,
    text: 'Consider a landscape with two hills and a single tree. The landscape is part of the world outside the mind.',
    cite: 'The world',
    dur: 2.7,
  },
  {
    p: 262, x: 268, land: 1,
    text: 'The hills and the tree are there whether or not anyone observes them.',
    dur: 1.8,
  },
  {
    p: 268, x: 148, land: 1, map: 1,
    text: 'Now suppose you sketch the landscape: two hills, one tree. The sketch stands for a belief, a claim about the land.',
    cite: 'The belief',
    dur: 3.2,
  },
  {
    p: 268, x: 148, land: 1, map: 1,
    text: 'The question is what makes such a claim true.',
    dur: 1.8,
  },
  {
    p: 440, x: 148, land: 1, map: 1, cards: 1,
    interact: {
      prompt: 'Which of the two maps of this landscape is true?',
      explain: 'Map A. It shows what the land contains, two hills and one tree. Neatness and your confidence in a drawing don’t make it true: the landscape itself decides.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 2, x: 148, land: 1, map: 1,
    text: 'Choosing that map applies the classical account of truth. A belief is true when it matches how things are.',
    cite: 'Correspondence',
    dur: 2.7,
  },
  {
    p: 266, x: 148, land: 1, map: 1,
    text: 'Truth, on this view, is a relation of fit between a belief and the world. The view is called the correspondence theory.',
    dur: 2.5,
  },
  {
    p: 144, x: 208, land: 1, map: 1,
    quote: {
      id: 'lq-epistemology-knowledge-9-1',
      text: 'To say of what is that it is, and of what is not that it is not, is true.',
      author: 'Aristotle',
      work: 'Metaphysics',
      era: 'c. 350 BCE',
      philosopherId: 'aristotle',
      branchSlugs: ['epistemology'],
    },
    dur: 3.6,
  },
  {
    p: 177, x: 148, land: 1, map: 1, link: 1,
    text: 'Suppose you try to check a belief against the world. You hold up the sketch and compare it with the land.',
    cite: 'The checking problem',
    dur: 2.5,
  },
  {
    p: 404, x: 148, land: 1, map: 1, link: 1,
    text: 'This raises a difficulty for the correspondence theory: what is the sketch compared against?',
    dur: 2.3,
  },
  {
    p: 165, x: 148, land: 1, map: 1, link: 1,
    interact: {
      prompt: 'If you can’t step outside your own beliefs, what does checking a map reach?',
      sort: {
        chip: 'checking your map',
        bins: [
          { id: 'land', label: 'the land', reads: 'the land itself, with nothing in between' },
          { id: 'seeing', label: 'your perception', reads: 'your perception, which is one more belief', correct: true },
          { id: 'other', label: 'a second map', reads: 'a second map, drawn by someone else' },
        ],
      },
      explain: 'Your perception. If you can’t step outside your beliefs, looking gives you a perceptual belief about the hills. So every check compares one belief with another. Direct realists reject the premise and hold that perception reaches the land itself.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 459, x: 268, land: 1, map: 1, theory: 1,
    text: 'The coherence theory gives a different answer. A belief is true if it fits with the rest of what you believe.',
    cite: 'Coherence',
    dur: 3.9,
  },
  {
    p: 459, x: 268, land: 1, map: 1, theory: 1,
    text: 'On this theory, truth is a matter of fitting into the whole web of belief.',
    dur: 1.8,
  },
  {
    p: 13, x: 268, land: 1, map: 1, theory: 2,
    text: 'Pragmatism gives another response. William James held that a true belief is one that works in practice.',
    cite: 'Pragmatism',
    dur: 1.8,
  },
  {
    p: 266, x: 268, land: 1, map: 1, theory: 2,
    text: 'A true map must guide you across the real hills reliably, over time. Being comforting is not enough: the belief must keep working in experience.',
    dur: 3.5,
  },
  {
    p: 163, x: 268,
    summary: {
      title: 'Three Theories of Truth',
      points: [
        'Correspondence: a true belief matches reality',
        'Checking a match seems to require further beliefs',
        'Coherence: a true belief fits a whole system of beliefs',
        'Pragmatism: a true belief keeps working in experience',
      ],
      closing: 'Knowledge requires truth, so every theory of knowledge depends on some account of what truth is.',
    },
    dur: 3.0,
  },
];
