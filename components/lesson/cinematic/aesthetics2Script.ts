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
}

export const BEATS: Aes2Beat[] = [
  {
    a: 22, v: 4,
    text: 'A dead painter is making you feel something right now. How does one mind’s feeling cross paint and centuries to reach yours?',
    dur: 3.6,
  },
  {
    a: 7, v: 0, wave: true, felt: true,
    text: 'Forget beauty and skill. Tolstoy says art is "infection": the maker relives a feeling and transmits it, so you feel the very same. Collingwood adds that real art clarifies a feeling not yet understood.',
    cite: 'Expression theory',
    dur: 5.0,
  },
  {
    a: 15, v: 15, wave: true, felt: true,
    text: 'A boy who once met a wolf retells his terror so vividly his listeners feel it too. That transfer of a real feeling, Tolstoy wrote, is art — and sincerity matters most of all.',
    cite: 'Tolstoy, What Is Art?, 1897',
    dur: 4.8,
  },
  {
    a: 1, v: 22, felt: true,
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
    a: 14, v: 8,
    mc: {
      prompt: 'What did Tolstoy believe was the primary purpose of art?',
      options: [
        { id: 'a', text: 'To transmit the artist’s feeling into the audience', correct: true },
        { id: 'b', text: 'To copy nature as beautifully as possible', correct: false },
        { id: 'c', text: 'To flaunt the artist’s technical skill', correct: false },
        { id: 'd', text: 'To deliver clear moral lessons', correct: false },
      ],
      explain:
        'Tolstoy called art "infection": the maker passes on a feeling so the audience shares it. He rejected beauty, pleasure, and skill as the test.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    a: 20, v: 17, wave: true, felt: true,
    text: 'If the expression theorists are right, emotion can be carried in lines, sounds, and words — and survive death, language, and centuries. Almost nothing else we build does that.',
    cite: 'Feeling made portable',
    dur: 4.4,
  },
  {
    a: 0, v: 22, felt: true,
    mc: {
      prompt: 'Crying at a film about people you know never existed — what does this show?',
      options: [
        { id: 'a', text: 'The emotion is fake, since the characters are fake', correct: false },
        { id: 'b', text: 'Real feeling for known fictions — a live puzzle, the paradox of fiction', correct: true },
        { id: 'c', text: 'You secretly believe the characters are real', correct: false },
        { id: 'd', text: 'Only badly made fiction can move us this way', correct: false },
      ],
      explain:
        'The trap: "fake people, so fake tears." Radford named this the paradox of fiction (1975) — the feeling is genuine, and explaining it is still debated.',
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
