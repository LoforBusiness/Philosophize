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
    text: 'Forget beauty and forget skill. Tolstoy calls art an infection. The maker feels something, puts the feeling into the work, and you catch the feeling off the work. Collingwood adds that makers often do not know the feeling until the work is finished.',
    cite: 'Expression theory',
    dur: 5.0,
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
    text: 'If they are right, a feeling can be packed into lines and sounds and words. It then outlives the person, the language and the century. Almost nothing else we build does that.',
    cite: 'Feeling made portable',
    dur: 4.4,
  },
  {
    a: 0, v: 22, felt: true, chain: 3,
    interact: {
      prompt: 'Crying at a film about people you know never existed — what does this show?',
      cards: [
        { text: 'Real feeling for known fictions', correct: true },
        { text: 'The tears are not real', correct: false },
      ],
      explain: 'The trap: fake people, so fake tears. The tears are real, and that is the puzzle. Radford called it the paradox of fiction, and nobody has settled it since.',
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
