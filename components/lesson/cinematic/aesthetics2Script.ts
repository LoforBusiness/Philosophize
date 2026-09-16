import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-2, "Art, Beauty, and Emotion" — expression
// theory. An artist relives a feeling and it TRAVELS across a gap to a viewer,
// who feels the same (Tolstoy's "infection"). The two figures emote expressively;
// a feeling-pulse crosses between them on the transmission beats.
//
// Both graded questions come from data/.../art-beauty-and-emotion.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes2Beat extends BaseBeat {
  /** Artist gesture (emote code). */ a?: number;
  /** Viewer gesture (emote code). */ v?: number;
  /** A feeling-pulse crosses from artist to viewer this beat. */ wave?: boolean;
  /** The viewer's chest glows (they feel it too), 0/1. */ felt?: boolean;
  /** How many links of the infection chain are filled in, 1→3. */ chain?: number;
  /** Each panel of the chain names its feeling: FEAR, Tolstoy's wolf story (0/1). */ fear?: number;
  /** The artist's own panel empties: the feeling outlives its maker (0/1). */ outlived?: number;
}

export const BEATS: Aes2Beat[] = [
  {
    a: 22, v: 4, chain: 1,
    text: 'A painting can move you centuries after its painter has died. How can one person’s feeling reach another through paint?',
    dur: 3.6,
  },
  {
    a: 7, v: 0, wave: true, felt: true, chain: 1,
    text: 'The expression theory defines art by feeling, not by beauty or skill. Leo Tolstoy compared art to an infection that spreads a feeling to others.',
    cite: 'Expression theory',
    dur: 1.8,
  },
  {
    a: 260, v: 158, wave: true, felt: true, chain: 3,
    text: 'The artist feels an emotion, the work carries the emotion, and the audience feels it too. For Collingwood, artists discover their feelings only by expressing them.',
    dur: 3.8,
  },
  {
    a: 387, v: 15, wave: true, felt: true, chain: 3, fear: 1,
    text: 'Tolstoy’s example is a boy who describes meeting a wolf and frightens his listeners. It’s art, provided the boy feels that fear again as he speaks.',
    cite: 'Tolstoy, What Is Art?, 1897',
    dur: 4.8,
  },
  {
    a: 1, v: 22, felt: true, chain: 3, fear: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-2-1',
      text: 'Art is a human activity consisting in this, that one man hands on to others feelings he has lived through.',
      author: 'Leo Tolstoy',
      work: 'What Is Art?',
      era: '1897',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.2,
  },
  {
    a: 14, v: 8, chain: 3, fear: 1,
    interact: {
      prompt: 'If Tolstoy is right, what must a work do to count as art?',
      cards: [
        { text: 'Transmit the artist’s feeling', correct: true },
        { text: 'Give pleasure through beauty', correct: false },
      ],
      explain: 'Transmit the artist’s feeling. Tolstoy called this infection: the artist evokes a feeling they’ve lived through, and the audience comes to share it. He rejected beauty and pleasure as the definition of art, so a beautiful object that transmits no feeling doesn’t count.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    a: 278, v: 17, wave: true, felt: true, chain: 3,
    text: 'If the expression theory is right, a work of art embodies a feeling in lines, sounds or words.',
    cite: 'Feeling made portable',
    dur: 3.4,
  },
  {
    a: 278, v: 17, wave: true, felt: true, chain: 3, outlived: 1,
    text: 'The feeling can then outlive its maker, and reach audiences in other languages and centuries.',
    dur: 1.8,
  },
  {
    a: 0, v: 22, felt: true, chain: 3, outlived: 1,
    interact: {
      prompt: 'You cry at a film you know is invented. What is the feeling behind your tears?',
      poll: {
        options: [
          { id: 'puzzle', reads: 'real pity for people you know don’t exist', holders: ['Colin Radford', 'Noël Carroll'], correct: true },
          { id: 'tidy', reads: 'make-believe pity, not the real thing', holders: ['Kendall Walton'] },
          { id: 'plain', reads: 'real sorrow that such evils could befall you', holders: ['Samuel Johnson'] },
          { id: 'odd', reads: 'an involuntary stirring, not a true emotion', holders: ['Seneca'] },
        ],
      },
      explain: 'Real pity for people you know don’t exist. The tears and the pity are genuine, which is the puzzle Colin Radford posed in 1975, the paradox of fiction.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Expression and the Paradox of Fiction',
      points: [
        'Tolstoy: art infects an audience with the artist’s feeling',
        'Collingwood: art clarifies a feeling',
        'Paradox of fiction: real emotion for fictional people',
      ],
      closing: 'The expression theory places feeling at the centre of art, whether transmitted or clarified.',
    },
    dur: 2.8,
  },
];
