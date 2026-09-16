import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-5, "Seeing the World Differently". A figure broods,
// a self-cloud hovering over its head and the ATTENTION meter almost entirely filled
// by SELF; then a kestrel hangs in the window, the cloud pops and the meter swings
// over to WORLD — Murdoch's "unselfing." Ruskin's single leaf follows, with the word
// the mind swaps in ("LEAF") struck out beside it. The second question is answered IN
// the scene: three GOAL cards in the frame.

export interface Aes5Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** The hovering kestrel 0..1. */ bird?: number;
  /** The brooding self-cloud 0..1 (fades as attention shifts). */ ego?: number;
  /** Ruskin's single leaf 0..1. */ leaf?: number;
  /** Share of the ATTENTION meter taken by the self, 0..1. */ self?: number;
}

export const BEATS: Aes5Beat[] = [
  {
    p: 165, bird: 0, ego: 1, self: 0.74,
    text: 'You look at the world all day, yet rarely attend to it closely. Iris Murdoch and John Ruskin both treated such attention as a skill.',
    dur: 3.6,
  },
  {
    p: 11, bird: 0, ego: 1, self: 0.88,
    text: 'Murdoch borrowed the concept of attention from Simone Weil. Attention is a just and loving look at one real thing.',
    cite: 'Attention as a skill',
    dur: 2.5,
  },
  {
    p: 257, bird: 0, ego: 1, self: 0.88,
    text: 'Murdoch calls the obstacle “the fat relentless ego”, a self absorbed in its own concerns. Attention draws the mind away from it.',
    dur: 2.7,
  },
  {
    p: 164, bird: 1, ego: 0, self: 0.06,
    text: 'Murdoch describes gazing out of a window, brooding on a blow to her prestige, when she sees a kestrel.',
    cite: 'Murdoch and the kestrel',
    dur: 3.8,
  },
  {
    p: 415, bird: 1, ego: 0, self: 0.06,
    text: 'The brooding self is lost for a moment, and only the kestrel remains. Murdoch calls this unselfing.',
    dur: 1.8,
  },
  {
    p: 147, bird: 1, ego: 0, self: 0.06,
    quote: {
      id: 'lq-aesthetics-aesthetics-5-1',
      text: 'I observe a hovering kestrel. In a moment everything is altered. The brooding self with its hurt vanity has disappeared.',
      author: 'Iris Murdoch',
      philosopherId: 'iris-murdoch',
      work: 'The Sovereignty of Good',
      era: '1970',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 384, bird: 1, ego: 0, self: 0.06,
    interact: {
      prompt: 'Is unselfing something you do, or something that happens to you?',
      split: {
        left: 'IT HAPPENS TO YOU', right: 'YOU DO IT',
        start: 0.04,
        zones: [
          { id: 'do', upto: 0.3, reads: 'a technique you practise and then perform' },
          { id: 'both', upto: 0.66, reads: 'partly effort, partly something that takes hold' },
          { id: 'happens', upto: 1, reads: 'something outside you absorbs your attention', correct: true },
        ],
      },
      explain: 'Something outside you absorbs your attention. For Murdoch, unselfing isn’t a technique you perform. It occurs when a kestrel or a painting holds your attention and the brooding self falls away. You can seek out such occasions, but unselfing itself happens to you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, bird: 0, ego: 0, leaf: 1, self: 0.12,
    text: 'John Ruskin wrote that painting depends on recovering “the innocence of the eye”. The innocent eye sees flat patches of colour before the mind names them.',
    cite: 'Ruskin’s drawing lessons',
    dur: 3.8,
  },
  {
    p: 266, bird: 0, ego: 0, leaf: 1, self: 0.12,
    text: 'Ruskin’s drawing exercises therefore begin with a single leaf, and only later reach a whole tree.',
    dur: 1.8,
  },
  {
    p: 160, bird: 0, leaf: 1, self: 0.12,
    // Answered ON the stage: the three GOAL cards inside the frame are the options,
    // so the reader picks an aim for the exercise instead of reading a list.
    interact: {
      prompt: 'Why start with a single leaf rather than a whole tree?',
      explain: 'Retrain the eye. Ruskin wanted students to see colour as it appears, not the idea the mind supplies. A fine drawing was a by-product, and practice was only the means. His goal was “the innocence of the eye”.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Attention and the Innocent Eye',
      points: [
        'Murdoch: loving attention dissolves the ego',
        'Ruskin: perception is a skill that can be trained',
        'Aesthetic attention extends beyond art to nature',
      ],
      closing: 'For Murdoch and Ruskin, aesthetic attention means seeing the thing in front of you, not your idea of it.',
    },
    dur: 2.8,
  },
];
