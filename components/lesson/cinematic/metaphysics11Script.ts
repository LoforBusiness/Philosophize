import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-11, "What Makes You, You?" — Locke's prince and
// cobbler, staged as two men on two labelled stands.
//
// THE PICTURE: two men, each standing on a low stand with his NAME written on it,
// and a plate reading MEMORIES hanging over one head. Over the lesson the plate
// travels from the prince's head to the cobbler's — and then the two NAMES cross
// the floor to follow it. Neither body moves an inch. That is Locke's argument:
// the name goes with the memories, not with the flesh.
//
// Q1 is A/B/C/D in the deck (which account of "same person" is Locke's — the one
// that needs the options read side by side). Q2 is answered on the stage: tap the
// stand of whoever is the prince now.

export interface Metaphysics11Beat extends BaseBeat {
  /** Prince gesture (emote code). He never leaves his stand. */ p?: number;
  /** Cobbler gesture (emote code). */ c?: number;
  /** Where the cobbler stands (stage x). 440 = off-stage right, 290 = his stand. */ cx?: number;
  /** The MEMORIES plate: 0 = over the prince · 1 = over the cobbler. */ tok?: number;
  /** 1 = the two name plates have crossed the floor and traded stands. */ swap?: number;
  /** 1 = the two stands are live answer targets (Q2). */ pick?: number;
  /** 1 = a "?" hovers in the gap between the stands, before the case names anyone. */ query?: boolean;
  /** 1 = a small "≠" appears under the MEMORIES badge — body and memory now disagree. */ disagree?: boolean;
  /** 1 = "= PERSON" appears under the MEMORIES badge, glossing consciousness as the person. */ person?: boolean;
}

export const BEATS: Metaphysics11Beat[] = [
  {
    p: 458, c: 42, cx: 440, tok: 0,
    text: 'Over a lifetime, much of the matter in a human body is replaced. Yet the person is still counted as the same person.',
    dur: 2.8,
  },
  {
    p: 458, c: 42, cx: 440, tok: 0, query: true,
    text: 'What, then, makes someone the same person over time?',
    dur: 1.8,
  },
  {
    p: 412, c: 42, cx: 290, tok: 0,
    text: 'John Locke describes a case involving two people, a prince and a cobbler.',
    cite: 'Locke’s prince and cobbler',
    dur: 4.4,
  },
  {
    p: 384, c: 44, tok: 0,
    text: 'The prince’s consciousness reaches back over his past life. He remembers his actions, back to his childhood.',
    cite: 'The prince’s memories',
    dur: 4.2,
  },
  {
    p: 173, c: 15, tok: 1,
    text: 'Suppose the prince’s consciousness, with all its memories, enters the cobbler’s body overnight. Neither body has moved.',
    cite: 'One night',
    dur: 3.4,
  },
  {
    p: 173, c: 15, tok: 1, disagree: true,
    text: 'The case pulls apart two things that usually stay together: having the same body, and having the same memory.',
    dur: 1.8,
  },
  {
    p: 165, c: 4, tok: 1,
    quote: {
      id: 'lq-metaphysics-being-11',
      text: 'Consciousness makes personal identity... as far as this consciousness can be extended backwards to any past action, so far reaches the identity of that person.',
      author: 'John Locke',
      work: 'An Essay Concerning Human Understanding, II.xxvii',
      era: '1694',
      philosopherId: 'john-locke',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 378, c: 31, tok: 1,
    interact: {
      prompt: 'As the memories go, which shape does the person take?',
      plot: {
        cols: ['ALL RECALLED', 'SOME', 'NONE'],
        axis: 'HOW MUCH OF THE PERSON',
        start: [0.5, 0.5, 0.5],
        shapes: [
          { id: 'body', profile: [1, 1, 1, 1, 1], reads: 'all of them while the body lives' },
          { id: 'mind', profile: [1, 0.78, 0.5, 0.22, 0], reads: 'it goes as the memories go', correct: true },
          { id: 'half', profile: [1, 0.9, 0.8, 0.72, 0.65], reads: 'most of it survives either way' },
        ],
      },
      explain: 'It goes as the memories go. Locke puts personal identity in consciousness of the past rather than in the living body, so on his account what makes you the same person thins out as the memories do. That\'s why the prince who wakes in the cobbler\'s body is the prince.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 170, c: 28, tok: 1, pick: 1,
    interact: {
      prompt: 'On Locke’s view, which of the two men is now the prince?',
      explain: 'The man on the stand labelled cobbler. He has the prince’s memories, so Locke counts him the same person as the prince. His body is still the cobbler’s, but for Locke a body secures only the same man.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 33, c: 35, tok: 1, swap: 1,
    text: 'Locke concludes that the man with the prince’s memories is now the prince. The name follows the memories, not the body.',
    cite: 'Locke’s verdict',
    dur: 3,
  },
  {
    p: 260, c: 167, tok: 1, swap: 1, person: true,
    text: 'Locke distinguishes the same man, one continuing living body, from the same person, one continuing consciousness.',
    dur: 1.8,
  },
  {
    p: 17, c: 33, tok: 1, swap: 1,
    summary: {
      title: 'Consciousness, Not Body, Makes the Person',
      points: [
        'A body’s matter changes over a lifetime, yet the person persists',
        'Locke separates the same man from the same person',
        'A person extends as far back as consciousness of past actions',
        'With the prince’s memories, the cobbler’s body is the prince',
      ],
      closing: 'Joseph Butler objected that memory presupposes personal identity, so it can’t be what constitutes it.',
    },
    dur: 3.0,
  },
];
