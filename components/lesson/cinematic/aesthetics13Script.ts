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
    dur: 4.0,
    text: 'Two canvases. One is a Vermeer. The other was painted last year by a man called van Meegeren, and no expert in Europe could separate them.',
  },
  {
    g: 4, art: 1, chain: 0,
    dur: 4.4,
    text: 'Look as long as you like. There is no brushstroke to find — the forger was better than the tests, which is exactly why the case is interesting.',
    cite: 'Nothing to find',
  },
  {
    g: 1, art: 1, chain: 1,
    dur: 4.8,
    text: 'So draw what you cannot see: where each canvas has been. One line runs back through three and a half centuries of hands. The other starts last year and stops.',
    cite: 'Where they have been',
  },
  {
    g: 144, art: 1, chain: 1,
    dur: 3.6,
    quote: {
      id: 'lq-aesthetics-aesthetics-13-2',
      text: 'The pictures differ aesthetically even if no one will ever be able to tell them apart merely by looking at them.',
      author: 'Nelson Goodman',
      work: 'Languages of Art',
      era: '1968',
      branchSlugs: ['aesthetics'],
    },
  },
  {
    g: 2, art: 1, chain: 1,
    dur: 4.6,
    text: 'When van Meegeren confessed in 1947, not a single canvas changed. The same paintings that had been called lost masterpieces became cheap imitations overnight.',
    cite: 'Nothing changed',
  },
  {
    g: 4, art: 1, chain: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'One is the Vermeer. Tap the only thing here that could tell you which.',
      explain: 'The history. Looking harder is the instinct and it is the one move guaranteed to fail — the forgery was built to survive it. What separates these two has never been on either canvas.',
      xp: 5,
    },
  },
  {
    g: 11, art: 1, chain: 1,
    dur: 1.0,
    interact: {
      prompt: 'Place the token on the forgery.',
      field: {
        xLo: 'THE FORMS DIFFER', xHi: 'THE FORMS ARE IDENTICAL',
        yLo: 'THE SAME HAND', yHi: 'DIFFERENT HANDS',
        start: [0.24, 0.24],
        quads: [
          { id: 'forge', x: 1, y: 1, reads: 'same to look at, different painters — equal, if only the surface counts', correct: true },
          { id: 'twin', x: 1, y: 0, reads: 'identical, and by the same hand: plainly equal' },
          { id: 'pair', x: 0, y: 1, reads: 'different to look at, different hands: an ordinary pair' },
          { id: 'two', x: 0, y: 0, reads: 'different to look at, one hand: two works by one painter' },
        ],
      },
      explain: 'Top right, and the formalist refuses to let the axis going up matter. Judging a work by where it came from is the genetic fallacy, and the refusal cuts both ways: if the visible form is identical, so is the value. Most people find they cannot go along with it.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The History You Cannot See',
      points: [
        'Autographic art ties value to this actual object',
        'Goodman: knowing one is a fake changes how you look at both',
        'Formalists: only the visible form can carry value',
        'Lessing: the fault is moral and historical, not perceptual',
      ],
      closing: 'A perfect fake is worth having around. It shows you how much of what you value in a picture was never in the picture.',
    },
    dur: 3.0,
  },
];
