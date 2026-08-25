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
    p: 25, x: 208,
    text: 'Everyone says they want the truth. Almost nobody can say what the word means. Try it: when you call something true, what exactly are you claiming?',
    dur: 4.0,
  },
  {
    p: 34, x: 268, land: 1,
    text: 'Start with the world. Two hills and one lonely tree, sitting there being exactly what they are. Whether or not anybody ever looks, draws, or argues about them.',
    cite: 'Out there',
    dur: 4.4,
  },
  {
    p: 40, x: 148, land: 1, map: 1,
    text: 'Back at the easel you sketch what you saw: two hills, one tree. That sketch is a claim about the land. Now — what would make it a good one?',
    cite: 'In here',
    dur: 4.6,
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
    text: 'You just used the oldest theory of truth. A belief is true when it matches how things actually are. Words on one side, world on the other, and truth is the fit. Philosophers call it correspondence.',
    cite: 'Correspondence',
    dur: 5.2,
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
    p: 45, x: 148, land: 1, map: 1, link: 1,
    text: 'Fine — go and check. Hold the sketch up, look at the land, compare the two. Easy. Until somebody asks a rude little question: what exactly are you comparing the sketch against?',
    cite: 'The awkward bit',
    dur: 4.8,
  },
  {
    p: 4, x: 148, land: 1, map: 1, link: 1,
    interact: {
      prompt: 'You hold your map up to check it. What do you actually compare it against?',
      cards: [
        { text: 'Your own seeing, another belief', correct: true },
        { text: 'The land itself, bare-handed', correct: false },
      ],
      explain: 'The trap: A feels obvious, because looking feels like touching the world bare-handed. But the instant you look, what you hold is your report of those hills — another belief. Every check compares a belief with a belief, and that gap is exactly why the next two theories exist.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 1, x: 268, land: 1, map: 1, theory: 1,
    text: 'One answer: stop hunting for a magic exit. A belief is true when it locks into everything else you hold — no contradictions, nothing left dangling. Truth is fitting the whole web.',
    cite: 'Coherence',
    dur: 4.8,
  },
  {
    p: 13, x: 268, land: 1, map: 1, theory: 2,
    text: 'The other answer is blunter. A belief is true if it keeps working. If it walks you across those real hills, year after year, and never once strands you. Comfort is not enough; only what survives the walk counts.',
    cite: 'Pragmatism',
    dur: 5.2,
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
