import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-5, "Seeing the World Differently". A figure broods,
// a self-cloud hovering over its head; then a kestrel hangs in the air and the
// brooding ego dissolves — Murdoch's "unselfing." A single leaf stands for Ruskin's
// "innocence of the eye." Questions A/B/C/D.

export interface Aes5Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** The hovering kestrel 0..1. */ bird?: number;
  /** The brooding self-cloud 0..1 (fades as attention shifts). */ ego?: number;
  /** Ruskin's single leaf 0..1. */ leaf?: number;
}

export const BEATS: Aes5Beat[] = [
  {
    p: 4, bird: 0, ego: 1,
    text: 'You look at the world all day, yet rarely see it. Aesthetics is attention training — it teaches the eye to wake up.',
    dur: 3.6,
  },
  {
    p: 11, bird: 0, ego: 1,
    text: 'Murdoch borrowed from Simone Weil: attention is "a just and loving gaze" at one reality. Normally the "fat, relentless ego" filters everything. Real attention quiets it, so reality comes forward.',
    cite: 'Attention as a skill',
    dur: 5.2,
  },
  {
    p: 25, bird: 1, ego: 0,
    text: 'At a window, brooding over a bruise to her pride, Murdoch sees a hovering kestrel. In a moment the brooding self vanishes — nothing now but kestrel. She called it "unselfing."',
    cite: 'Murdoch and the kestrel',
    dur: 5.0,
  },
  {
    p: 19, bird: 1, ego: 0,
    quote: {
      id: 'lq-aesthetics-aesthetics-5-1',
      text: 'I observe a hovering kestrel. In a moment everything is altered. The brooding self with its hurt vanity has disappeared.',
      author: 'Iris Murdoch',
      work: 'The Sovereignty of Good',
      era: '1970',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 19, bird: 1, ego: 0,
    mc: {
      prompt: 'What did Iris Murdoch mean by "unselfing"?',
      options: [
        { id: 'a', text: 'Some real thing absorbs you so fully the ego drops away', correct: true },
        { id: 'b', text: 'A meditation technique for shedding your identity', correct: false },
        { id: 'c', text: 'Deciding the self is an illusion', correct: false },
        { id: 'd', text: 'Putting others’ needs above your own', correct: false },
      ],
      explain: 'Unselfing is not a technique you perform but something that happens to you: a kestrel or artwork grips you so wholly the self-preoccupied ego vanishes.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, bird: 0, ego: 0, leaf: 1,
    text: 'Ruskin taught that drawing recovers "the innocence of the eye" — seeing patches of colour as they truly are, before the mind swaps in its idea. His students studied one leaf before any tree.',
    cite: 'Ruskin’s drawing lessons',
    dur: 5.0,
  },
  {
    p: 4, bird: 0, leaf: 1,
    mc: {
      prompt: 'Ruskin had students draw a single leaf for hours. What was the real goal?',
      options: [
        { id: 'a', text: 'To master leaves before drawing harder subjects', correct: false },
        { id: 'b', text: 'To produce a gallery-worthy finished picture', correct: false },
        { id: 'c', text: 'To retrain the eye to see colours, not its idea of the thing', correct: true },
        { id: 'd', text: 'To prove that talent matters more than practice', correct: false },
      ],
      explain: 'The trap: "drawing class, so the goal is a good drawing." For Ruskin the payoff was sharpened vision — "the innocence of the eye" — not a masterpiece.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Aesthetics Changes How You See',
      points: [
        'Murdoch: loving attention dissolves the ego',
        'Perception is a skill you can sharpen',
        'Aesthetics is attention, not just art',
      ],
      closing: 'Aesthetics trains you to truly see what already surrounds you.',
    },
    dur: 2.8,
  },
];
