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
    text: 'Everyone says they want the truth. Almost nobody can say what the word means.',
    dur: 2.2,
  },
  {
    p: 164, x: 208,
    text: 'Try it: when you call something true, what exactly are you claiming?',
    dur: 1.8,
  },
  {
    p: 34, x: 268, land: 1,
    text: 'Start with the world. Two hills and one lonely tree, sitting there being exactly what they are.',
    cite: 'Out there',
    dur: 2.7,
  },
  {
    p: 34, x: 268, land: 1,
    text: 'Whether or not anybody ever looks, draws, or argues about them.',
    dur: 1.8,
  },
  {
    p: 40, x: 148, land: 1, map: 1,
    text: 'Back at the easel you sketch what you saw: two hills, one tree. That sketch is a claim about the land.',
    cite: 'In here',
    dur: 3.2,
  },
  {
    p: 40, x: 148, land: 1, map: 1,
    text: 'Now — what would make it a good one?',
    dur: 1.8,
  },
  {
    p: 47, x: 148, land: 1, map: 1, cards: 1,
    interact: {
      prompt: 'Two maps of that same land are pinned up. Tap the one that is TRUE.',
      explain: 'Map A is true for one plain, powerful reason: it matches the land. Not the neatness of the drawing, not how sure you feel about it — the hills out there decide.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 2, x: 148, land: 1, map: 1,
    text: 'You just used the oldest theory of truth. A belief is true when it matches how things actually are.',
    cite: 'Correspondence',
    dur: 2.7,
  },
  {
    p: 2, x: 148, land: 1, map: 1,
    text: 'Words on one side, world on the other, and truth is the fit. Philosophers call it correspondence.',
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
    p: 159, x: 148, land: 1, map: 1, link: 1,
    text: 'Fine — go and check. Hold the sketch up, look at the land, compare the two.',
    cite: 'The awkward bit',
    dur: 2.5,
  },
  {
    p: 404, x: 148, land: 1, map: 1, link: 1,
    text: 'Until somebody asks a rude little question: what exactly are you comparing the sketch against?',
    dur: 2.3,
  },
  {
    p: 4, x: 148, land: 1, map: 1, link: 1,
    interact: {
      prompt: 'When you check a map against the world, what do you actually reach?',
      sort: {
        chip: 'checking your map',
        bins: [
          { id: 'land', label: 'the land', reads: 'the land itself, with nothing in between' },
          { id: 'seeing', label: 'your own seeing', reads: 'your own seeing, which is one more belief', correct: true },
          { id: 'other', label: 'a second map', reads: 'a second map, drawn by somebody else' },
        ],
      },
      explain: 'Your own seeing. "the land" feels obvious, because looking feels like touching the world bare-handed. The instant you look, what you are holding is your report of those hills. Every check compares a belief with a belief, and that is the whole difficulty.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 268, land: 1, map: 1, theory: 1,
    text: 'One answer: stop hunting for a magic exit. A belief is true when it locks into everything else you hold — no contradictions, nothing left dangling.',
    cite: 'Coherence',
    dur: 3.9,
  },
  {
    p: 167, x: 268, land: 1, map: 1, theory: 1,
    text: 'Truth is fitting the whole web.',
    dur: 1.8,
  },
  {
    p: 13, x: 268, land: 1, map: 1, theory: 2,
    text: 'The other answer is blunter. A belief is true if it keeps working.',
    cite: 'Pragmatism',
    dur: 1.8,
  },
  {
    p: 13, x: 268, land: 1, map: 1, theory: 2,
    text: 'If it walks you across those real hills, year after year, and never once strands you. Comfort is not enough; only what survives the walk counts.',
    dur: 3.5,
  },
  {
    p: 28, x: 268,
    summary: {
      title: 'Three Ways to Be True',
      points: [
        'Correspondence: your belief matches reality',
        'Checking the match takes another belief',
        'Coherence: it fits everything else you hold',
        'Pragmatism: it keeps on working',
      ],
      closing: 'You cannot know a thing that is false. So every theory of knowledge is quietly a theory of truth.',
    },
    dur: 3.0,
  },
];
