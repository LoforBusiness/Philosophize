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
}

export const BEATS: Epis32Beat[] = [
  {
    g: 5, maps: 0,
    dur: 4.0,
    text: 'Four maps of the same stretch of coast. Not four coastlines — one coastline, drawn four times at four scales.',
  },
  {
    g: 1, maps: 1,
    dur: 4.2,
    text: 'The first is the whole country in one stroke. Nothing on it is false. There is simply almost nothing on it.',
    cite: 'One line',
  },
  {
    g: 3, maps: 3,
    dur: 4.8,
    text: 'The second gives you the shape and its bays. The third gives you every rock. It is also the sort of map you would still be reading when the tide came in.',
    cite: 'More and more',
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
    g: 45, maps: 4,
    dur: 4.6,
    text: 'And here is the perfect one. One to one, nothing omitted, no error anywhere in it. At that scale the frame holds a single rock.',
    cite: 'The perfect map',
  },
  {
    g: 2, maps: 4, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'You are sailing this coast tonight. Tap the map you would take.',
      explain: 'The second. The first cannot be sailed by and the third cannot be read in the dark, and the fourth omits nothing at all — which is why it can only show you the rock you are standing on.',
      xp: 5,
    },
  },
  {
    g: 10, maps: 4,
    dur: 1.0,
    interact: {
      prompt: 'Drag to how much detail a good model keeps.',
      drag: {
        lo: 'ALMOST NONE',
        hi: 'EVERY LAST THING',
        start: 1,
        zones: [
          { id: 'bare', upto: 0.24, reads: 'almost nothing, so it explains almost nothing' },
          { id: 'chosen', upto: 0.72, reads: 'the few things the question needs, and no more', correct: true },
          { id: 'all', upto: 1, reads: 'everything, at which point it is the thing itself' },
        ],
      },
      explain: 'The middle, and the far end is what the fourth map showed. Add detail without limit and you get the coastline back at coastline size, which is no use to anybody. Leaving things out is the job, not the shortfall.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Built for a Task',
      points: [
        'Every model leaves things out on purpose',
        'More detail is not the same as more accuracy',
        'A map is judged by the job, not by resemblance',
        'Ask what a model omits before you trust it',
      ],
      closing: 'The question is never whether your picture of the world is complete. It is whether it leaves out the right things.',
    },
    dur: 3.0,
  },
];
