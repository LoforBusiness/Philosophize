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
}

export const BEATS: Aes2Beat[] = [
  {
    a: 22, v: 4, chain: 1,
    text: 'A dead painter is making you feel something right now. How does one mind’s feeling cross paint and centuries to reach yours?',
    dur: 3.6,
  },
  {
    a: 7, v: 0, wave: true, felt: true, chain: 3,
    text: 'Forget beauty and forget skill. Tolstoy calls art an infection.',
    cite: 'Expression theory',
    dur: 1.8,
  },
  {
    a: 7, v: 0, wave: true, felt: true, chain: 3,
    text: 'The maker feels something, puts the feeling into the work, and you catch the feeling off the work. Collingwood adds that makers often do not know the feeling until the work is finished.',
    dur: 3.8,
  },
  {
    a: 15, v: 15, wave: true, felt: true, chain: 3,
    text: 'A boy who once met a wolf tells the story so well that the room is frightened too. Tolstoy calls that art, and says the telling only works if the boy means every word.',
    cite: 'Tolstoy, What Is Art?, 1897',
    dur: 4.8,
  },
  {
    a: 1, v: 22, felt: true, chain: 3,
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
    a: 14, v: 8, chain: 3,
    interact: {
      prompt: 'Tap what Tolstoy thinks art is actually doing.',
      cards: [
        { text: 'To transmit the artist\'s feeling', correct: true },
        { text: 'To make beautiful objects', correct: false },
      ],
      explain: 'Tolstoy called art "infection": the maker passes on a feeling so the audience shares it. He rejected beauty, pleasure, and skill as the test.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    a: 20, v: 17, wave: true, felt: true, chain: 3,
    text: 'If they are right, a feeling can be packed into lines and sounds and words. It then outlives the person, the language and the century.',
    cite: 'Feeling made portable',
    dur: 3.4,
  },
  {
    a: 20, v: 17, wave: true, felt: true, chain: 3,
    text: 'Almost nothing else we build does that.',
    dur: 1.8,
  },
  {
    a: 0, v: 22, felt: true, chain: 3,
    interact: {
      prompt: 'Place the token on what happens at a film.',
      field: {
        xLo: 'THE PEOPLE ARE REAL', xHi: 'THE PEOPLE NEVER EXISTED',
        yLo: 'THE TEARS ARE PRETEND', yHi: 'THE TEARS ARE REAL',
        start: [0.24, 0.24],
        quads: [
          { id: 'puzzle', x: 1, y: 1, reads: 'made-up people, and real tears', correct: true },
          { id: 'tidy', x: 1, y: 0, reads: 'made-up people, and pretend tears' },
          { id: 'plain', x: 0, y: 1, reads: 'real people, and real tears' },
          { id: 'odd', x: 0, y: 0, reads: 'real people, and pretend tears' },
        ],
      },
      explain: 'Top right, and nothing sits comfortably there. Fake people, so fake tears is the tidy corner and it is simply untrue: the tears are real, which is exactly the difficulty. Radford called it the paradox of fiction and nobody has settled it since.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Art Connects Minds',
      points: [
        'Tolstoy: art "infects" with the maker’s feeling',
        'Collingwood: art clarifies a feeling',
        'Paradox of fiction: real tears, unreal people',
      ],
      closing: 'Expression theory: art’s core is feeling, transmitted or clarified.',
    },
    dur: 2.8,
  },
];
