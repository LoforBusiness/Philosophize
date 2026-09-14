import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-7, "What Is Time, Really?" — presentism versus the
// block universe, taught on a timeline the figure literally WALKS along. Three
// slices hang on the line: PAST, NOW, FUTURE. A spotlight travels with the figure,
// and under presentism only the middle slice is filled in — walk to yesterday and
// the spotlight finds an empty frame. On the eternalism beat all three fill at once.
//
// Q1 is answered ON the timeline (tap a slice, or ALL THREE); Q2 is A/B/C/D.
// The names — presentism, eternalism — arrive only after the reader has already
// used the idea, so the jargon lands as a label for something they can already see.

export interface Metaphysics7Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 70 = under PAST · 200 = NOW · 330 = FUTURE. */ x?: number;
  /** The timeline itself — rule, arrows, stems, slices — 0..1. */ line?: number;
  /** 0 = presentism (only NOW is inked) · 1 = eternalism (all three inked). */ solid?: number;
  /** 1 = the travelling "YOUR NOW" spotlight ring is lit. */ spot?: number;
  /** 1 = the four slice targets are live (Q1). */ pick?: number;
}

export const BEATS: Metaphysics7Beat[] = [
  {
    p: 462, x: 200,
    text: 'You only ever experience the present moment. You never directly feel yesterday or tomorrow.',
    dur: 2.9,
  },
  {
    p: 462, x: 200,
    text: 'This raises a metaphysical question. Do past and future moments exist, or only the present one?',
    dur: 1.8,
  },
  {
    p: 47, x: 200, line: 1, spot: 1,
    text: 'Consider time as a line running from earlier to later, with three moments marked: yesterday, now and tomorrow.',
    cite: 'The timeline',
    dur: 2.5,
  },
  {
    p: 47, x: 200, line: 1, spot: 1,
    text: 'On this picture, the moments look like places, each as real as the others.',
    dur: 1.9,
  },
  {
    p: 6, x: 70, line: 1, spot: 1,
    text: 'Suppose only the present exists. Then yesterday has no place on the line, and its frame is empty.',
    cite: 'Yesterday',
    dur: 2.4,
  },
  {
    p: 6, x: 70, line: 1, spot: 1,
    text: 'On this view, the past isn’t stored somewhere else. It no longer exists at all.',
    dur: 2,
  },
  {
    p: 41, x: 330, line: 1, spot: 1,
    text: 'The future is in the same position. Tomorrow doesn’t exist yet.',
    cite: 'Tomorrow',
    dur: 1.9,
  },
  {
    p: 41, x: 330, line: 1, spot: 1,
    text: 'So its frame is empty too, because that moment hasn’t yet occurred.',
    dur: 2.3,
  },
  {
    p: 458, x: 200, line: 1, spot: 1,
    text: 'This view is called presentism: only present things exist.',
    cite: 'Presentism',
    dur: 3.4,
  },
  {
    p: 458, x: 200, line: 1, spot: 1,
    text: 'For the presentist, reality consists of a single moment, and which moment that is keeps changing.',
    dur: 1.8,
  },
  {
    p: 5, x: 70, line: 1,
    text: 'A rival theory of time rejects this picture. It compares time to a printed book.',
    cite: 'A different picture',
    dur: 2,
  },
  {
    p: 5, x: 70, line: 1,
    text: 'Page four hundred is as fully printed as page one. Where you happen to be reading makes no page more real.',
    dur: 2.8,
  },
  {
    p: 165, x: 70, line: 1, pick: 1,
    interact: {
      prompt: 'If time is like a printed book, which moments are real?',
      explain: 'All three. If every page is already printed, no page is more real than the others. Yesterday and tomorrow aren’t missing. They’re pages you aren’t reading now. Picking only now gives the presentist answer instead.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 33, x: 200, line: 1, solid: 1,
    text: 'This view is called eternalism. Past, present and future moments all exist, forming a block universe.',
    cite: 'Eternalism · the block universe',
    dur: 2.1,
  },
  {
    p: 33, x: 200, line: 1, solid: 1,
    text: 'On this view, the word “now” works like the word “here”. Each marks the speaker’s position, not a privileged part of reality.',
    dur: 3.1,
  },
  {
    p: 12, x: 200, line: 1, solid: 1,
    interact: {
      prompt: 'How much change is real in a block universe?',
      drag: {
        lo: 'NOTHING CHANGES',
        hi: 'A MOVING PRESENT',
        start: 0,
        zones: [
          { id: 'frozen', upto: 0.3, reads: 'no change at all, a frozen world' },
          { id: 'differ', upto: 0.74, reads: 'change is difference between earlier and later moments', correct: true },
          { id: 'flow', upto: 1, reads: 'a real present moves along the line' },
        ],
      },
      explain: 'Change is difference between earlier and later moments. The block isn’t frozen, because its moments differ from one another, and that difference is change. What the block denies is a moving present that passes along the line.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 139, x: 70, line: 1, solid: 1,
    quote: {
      id: 'lq-metaphysics-being-7-1',
      text: 'What then is time? If no one asks me, I know; if I wish to explain it to one who asks, I know not.',
      author: 'Augustine of Hippo',
      work: 'Confessions, Book XI',
      era: 'c. 398 CE',
      philosopherId: 'augustine',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.8,
  },
  {
    summary: {
      title: 'Presentism and Eternalism',
      points: [
        'Presentism: only the present exists',
        'Eternalism: past, present and future all exist',
        'Augustine: time is familiar yet hard to define',
        '“Now” may work like “here”, marking a position',
      ],
      closing: 'Physics measures time, but it doesn’t settle whether only the present exists.',
    },
    dur: 3.0,
  },
];
