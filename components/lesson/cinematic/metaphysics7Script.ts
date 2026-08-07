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
    p: 25, x: 200,
    text: 'You have never once been anywhere but right now. Not yesterday, not tomorrow — always now. So where is yesterday keeping itself?',
    dur: 4.0,
  },
  {
    p: 47, x: 200, line: 1, spot: 1,
    text: 'Draw time as a road. Three slices hang on it: yesterday, this second, tomorrow. It looks like a row of rooms you could stroll between.',
    cite: 'The timeline',
    dur: 4.4,
  },
  {
    p: 6, x: 70, line: 1, spot: 1,
    text: 'So stroll to yesterday and point at it. Nothing there — just an empty frame. Yesterday is not filed away somewhere else. It is nowhere at all.',
    cite: 'Yesterday',
    dur: 4.4,
  },
  {
    p: 41, x: 330, line: 1, spot: 1,
    text: 'Tomorrow is worse. It has not been built yet. Another empty frame, waiting on a moment that has not happened.',
    cite: 'Tomorrow',
    dur: 4.2,
  },
  {
    p: 28, x: 200, line: 1, spot: 1,
    text: 'Only the middle frame is filled in — the one you are standing in. That view has a name: presentism. Reality is one lit slice, and it keeps moving.',
    cite: 'Presentism',
    dur: 5.0,
  },
  {
    p: 5, x: 70, line: 1,
    text: 'Other thinkers say that picture is upside down. Think of a book. Page four hundred is no less printed than page one. You just happen to be reading here.',
    cite: 'A different picture',
    dur: 4.8,
  },
  {
    p: 4, x: 70, line: 1, pick: 1,
    interact: {
      prompt: 'Every page of the book is already printed. On that view, tap the moments that are real.',
      explain: 'If every page is already printed, no page gets to be more real than the others. Yesterday and tomorrow are not missing. They are pages you are simply not reading right now.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 33, x: 200, line: 1, solid: 1,
    text: 'All three fill in at once. That is eternalism — the block universe. Every moment exists, and "now" is just where you are standing, the way "here" is just where you are.',
    cite: 'Eternalism · the block universe',
    dur: 5.2,
  },
  {
    p: 12, x: 200, line: 1, solid: 1,
    mc: {
      prompt: 'If every moment already exists, has the block universe just declared change to be a lie?',
      options: [
        { id: 'a', text: 'Yes — if it is all already there, nothing really changes', correct: false },
        { id: 'b', text: 'No — every moment is equally real; the flow you feel is you moving through them', correct: true },
        { id: 'c', text: 'Yes — only the whole block is real, so single moments are illusions', correct: false },
        { id: 'd', text: 'No — because the block universe says only the present exists', correct: false },
      ],
      explain: 'The trap: "already there" sounds exactly like "frozen". But the block is full of differences between its slices, and that IS change. What it denies is a magic spotlight sweeping along the line. The thing that moves is you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 44, x: 70, line: 1, solid: 1,
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
      title: 'Now Is Just Where You Stand',
      points: [
        'Presentism: only this instant is real',
        'Eternalism: every moment printed, like pages',
        'Augustine: easy to live, hard to explain',
        '"Now" may work like "here" — a viewpoint',
      ],
      closing: 'Physics can time the ticks beautifully. It still cannot tell you why now feels like now.',
    },
    dur: 3.0,
  },
];
