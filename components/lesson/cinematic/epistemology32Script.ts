import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-32, "The Map Is Not the Territory".
//
// THE PICTURE: four maps of the SAME coastline at four scales, filling in one after
// another. The coast profile is one function sampled at 1, 5, 13 and (at one-to-one)
// a single rock — so the four panels are literally the same coast, and watching
// usefulness climb and then fall off a cliff is the argument (H64).
//
// STAGING: a 2 × 2 board of panels whose DETAIL DRAWS IN bar by bar, and the answer
// targets are the four panels — you answer by choosing a scale, not a sentence.

export interface Epis32Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many panels have filled in, 0…4. */ maps?: number;
  /** 1 = the four panels are live targets (Q1). */ pick?: number;
  /** 1 = a dashed ring round the whole first panel — almost no information in it. */ sparseRing?: number;
  /** 1 = a dashed ring round the whole third panel — too much detail to use at sea. */ slowRing?: number;
  /** 1 = a dashed ring round the fourth panel's single bar — it fills the frame. */ frameRing?: number;
}

export const BEATS: Epis32Beat[] = [
  {
    g: 5, maps: 0,
    dur: 4.0,
    text: 'Consider four maps of the same stretch of coast, each drawn at a different scale.',
  },
  {
    g: 459, maps: 1,
    dur: 2.8,
    text: 'The first map shows the whole coast as a single line. Nothing on it is false.',
    cite: 'One line',
  },
  {
    g: 459, maps: 1, sparseRing: 1,
    dur: 1.8,
    text: 'But it contains almost no information about the coast.',
  },
  {
    g: 168, maps: 3,
    dur: 2.3,
    text: 'The second map shows the coast’s shape and its bays. The third shows every rock.',
    cite: 'More detail',
  },
  {
    g: 168, maps: 3, slowRing: 1,
    dur: 2.6,
    text: 'But the third map holds so much detail that it’s too slow to use at sea.',
  },
  {
    g: 129, maps: 3,
    dur: 3.6,
    quote: {
      id: 'lq-epistemology-knowledge-32-1',
      text: 'A map is not the territory it represents, but, if correct, it has a similar structure to the territory.',
      author: 'Alfred Korzybski',
      work: 'Science and Sanity',
      era: '1933',
      branchSlugs: ['epistemology'],
    },
  },
  {
    g: 159, maps: 4,
    dur: 2.9,
    text: 'The fourth map is drawn at a scale of one to one, with nothing omitted and no errors.',
    cite: 'The perfect map',
  },
  {
    g: 159, maps: 4, frameRing: 1,
    dur: 1.8,
    text: 'At that scale, a frame of the same size shows a single rock.',
  },
  {
    g: 2, maps: 4, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Suppose you’re sailing this coast tonight. Which map would serve you best?',
      explain: 'The second map, of the coast and its bays. The first is too sparse to navigate by, and the third too detailed to read quickly. The fourth omits nothing, so its frame shows only one rock.',
      xp: 5,
    },
  },
  {
    g: 10, maps: 4,
    dur: 1.0,
    interact: {
      prompt: 'As a model keeps more detail, which shape does its usefulness take?',
      plot: {
        cols: ['ALMOST NOTHING', 'WHAT IS NEEDED', 'EVERYTHING'],
        axis: 'WHAT IT EXPLAINS',
        start: [0.3, 0.3, 0.3],
        shapes: [
          { id: 'hump', profile: [0.08, 0.55, 0.95, 0.55, 0.1], reads: 'best in the middle, and falls either side', correct: true },
          { id: 'rise', profile: [0.05, 0.3, 0.55, 0.8, 1], reads: 'the more detail the better' },
          { id: 'flat', profile: [0.6, 0.6, 0.6, 0.6, 0.6], reads: 'detail makes no difference' },
        ],
      },
      explain: 'Best in the middle. A model that keeps almost nothing explains almost nothing, and one that keeps everything has become the thing it was meant to explain. What a good model keeps is whatever the question needs and no more.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Models and Their Purposes',
      points: [
        'Every model leaves things out on purpose',
        'More detail is not the same as more accuracy',
        'A map is judged by its purpose, not by resemblance',
        'Ask what a model omits before you trust it',
      ],
      closing: 'No model of the world is complete. A good model leaves out what its purpose doesn’t need.',
    },
    dur: 3.0,
  },
];
