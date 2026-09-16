import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-13, "Why a Perfect Fake Still Bothers Us" — a
// CONVERSION of an existing card deck, at the Aesthetics frontier (§5).
//
// THE PICTURE: two canvases the reader genuinely cannot tell apart, and underneath
// them a provenance line that DRAWS BACKWARDS in time — three and a half centuries
// under one of them, a single link under the other. The difference is real and it is
// nowhere on the canvas, which is the lesson (H64).
//
// STAGING: the answer targets are the two pictures and the history beneath them, so
// the reader's first instinct — look harder at the painting — is a live wrong answer
// they can actually commit (E33, H66).

export interface Aes13Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How far the provenance has been drawn back, 0…1. */ chain?: number;
  /** 1 = the two canvases are on the wall. */ art?: number;
  /** 1 = the pictures and the history are live targets (Q1). */ pick?: number;
}

export const BEATS: Aes13Beat[] = [
  {
    g: 5, art: 1, chain: 0,
    dur: 1.8,
    text: 'Suppose two canvases hang side by side and look identical. One is a Vermeer.',
  },
  {
    g: 259, art: 1, chain: 0,
    dur: 3.1,
    text: 'The other is a forgery painted last year. Han van Meegeren’s 1937 fake fooled Abraham Bredius, a leading expert.',
  },
  {
    g: 461, art: 1, chain: 0,
    dur: 4.4,
    text: 'By hypothesis, no visible feature tells the two canvases apart. No amount of close inspection reveals which is genuine.',
    cite: 'Perceptually indistinguishable',
  },
  {
    g: 459, art: 1, chain: 1,
    dur: 3.7,
    text: 'The difference lies in provenance, the history of each canvas from the moment it was made. The Vermeer’s history runs back three and a half centuries.',
    cite: 'Provenance',
  },
  {
    g: 459, art: 1, chain: 1,
    dur: 1.8,
    text: 'The forgery’s history begins last year, with the forger who painted it.',
  },
  {
    g: 144, art: 1, chain: 1,
    dur: 3.6,
    quote: {
      id: 'lq-aesthetics-aesthetics-13-2',
      text: 'The pictures differ aesthetically even if no one will ever be able to tell them apart merely by looking at them.',
      author: 'Nelson Goodman',
      philosopherId: 'nelson-goodman',
      work: 'Languages of Art',
      era: '1968',
      branchSlugs: ['aesthetics'],
    },
  },
  {
    g: 406, art: 1, chain: 1,
    dur: 4.6,
    text: 'When van Meegeren confessed in 1945, the canvases themselves did not change. Yet paintings once hailed as masterpieces were soon dismissed as forgeries.',
    cite: 'The confession',
  },
  {
    g: 455, art: 1, chain: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'What here could establish which canvas is the Vermeer?',
      explain: 'Where it has been, the history of each canvas. By hypothesis the two look the same, so looking harder can’t settle the question. Only their provenance can show which is the Vermeer.',
      xp: 5,
    },
  },
  {
    g: 165, art: 1, chain: 1,
    dur: 1.0,
    interact: {
      prompt: 'What difference does it make to learn that a painting is a forgery?',
      poll: {
        options: [
          { id: 'forge', reads: 'an aesthetic difference in how you look', holders: ['Nelson Goodman'], correct: true },
          { id: 'twin', reads: 'none, and preferring the original is snobbery', holders: ['Arthur Koestler'] },
          { id: 'pair', reads: 'a loss of originality, not of aesthetic value', holders: ['Alfred Lessing'] },
          { id: 'two', reads: 'none, if the copy is absolutely exact', holders: ['Clive Bell'] },
        ],
      },
      explain: 'An aesthetic difference in how you look. Goodman argues that knowing a painting is forged rightly guides what you look for. So the preference isn’t mere snobbery.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Forgery and the History of a Work',
      points: [
        'In autographic art, only the original object is the work',
        'Goodman: knowing which is forged changes how you look',
        'Formalists: only the visible form can carry value',
        'Alfred Lessing: a forgery lacks originality, not aesthetic value',
      ],
      closing: 'A perfect forgery shows that part of a painting’s value may lie outside what can be seen.',
    },
    dur: 3.0,
  },
];
