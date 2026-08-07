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
}

export const BEATS: Metaphysics11Beat[] = [
  {
    p: 28, c: 42, cx: 440, tok: 0,
    text: 'Nearly every scrap of matter this man was born with has been replaced. The name under him has not moved once. What is it holding on to?',
    dur: 3.6,
  },
  {
    p: 45, c: 42, cx: 290, tok: 0,
    text: 'Locke asks you to picture two of them. A prince — and a cobbler, who walks in off the street having never once seen a palace.',
    cite: 'The two men',
    dur: 4.4,
  },
  {
    p: 30, c: 44, tok: 0,
    text: 'The plate above the prince is everything he can remember doing: every room, every promise, the whole thread running back to his childhood.',
    cite: 'What hangs above him',
    dur: 4.2,
  },
  {
    p: 46, c: 15, tok: 1,
    text: 'Overnight the whole thread leaves the prince and settles above the cobbler. Neither man has taken a step. Only the memories have moved.',
    cite: 'One night',
    dur: 4.4,
  },
  {
    p: 11, c: 4, tok: 1,
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
    p: 8, c: 31, tok: 1,
    mc: {
      prompt: 'On Locke’s account, what makes someone the same person over time?',
      options: [
        { id: 'a', text: 'The consciousness that reaches back over their own past', correct: true },
        { id: 'b', text: 'The same living body, traced back without a break', correct: false },
        { id: 'c', text: 'A soul underneath, whatever the memories do', correct: false },
        { id: 'd', text: 'Nothing — "the same person" is a convenient fiction', correct: false },
      ],
      explain: 'The trap: the bodily answer is the one you would give a court, and it feels safest. But a body replaces nearly all its matter over a lifetime — it is the Ship of Theseus wearing your face. Locke hangs identity on the thread of consciousness instead.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 22, c: 28, tok: 1, pick: 1,
    interact: {
      prompt: 'The memories now sit over the man on the right. Tap the stand of whoever is the prince.',
      explain: 'The trap: his stand still says COBBLER, and it is his own body — which is what a court would go by. Locke says follow the memories. The man on the right remembers being the prince, so the prince is who he is.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 33, c: 35, tok: 1, swap: 1,
    text: 'Now watch the ground. Nobody moves, and yet the two names cross the floor and trade stands. The name goes where the memories went.',
    cite: 'The names follow',
    dur: 4.2,
  },
  {
    p: 17, c: 33, tok: 1, swap: 1,
    summary: {
      title: 'You Are the Thread',
      points: [
        'You change completely and stay one person',
        'Same body fails — its matter is all replaced',
        'Locke: consciousness reaching back carries identity',
        'The name follows the memories, not the flesh',
      ],
      closing: 'You are not your atoms. You are the thread of awareness that remembers being you.',
    },
    dur: 3.0,
  },
];
