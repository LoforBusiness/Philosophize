import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-4, "Can Nothing Truly Exist?" — Parmenides' trap.
// A figure reaches into a dark void to grasp "nothing" — and every reach pops a
// token (a something) into the air: the moment you think of nothing, you make it a
// thing. Then the figure proclaims Parmenides' verdict: what-is-not cannot be. Void
// to the left, tokens in the gap, figure to the right — no overlap.
//
// Graded questions are the two from data/.../can-nothing-truly-exist.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Meta4Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** How many "somethings" have popped out of the void (0..3). */ tokens?: number;
}

export const BEATS: Meta4Beat[] = [
  {
    p: 2, tokens: 0,
    text: 'Say "nothing exists" and you have said too much. Parmenides found this snag 2,500 years ago — and it still bites.',
    dur: 3.4,
  },
  {
    p: 14, tokens: 1,
    text: 'Try to deny non-being. The moment you think of nothing, you make it the object of a thought — and a thought needs something to be about. Each grab at nothing turns it into a thing.',
    cite: 'A self-defeating paradox',
    dur: 5.0,
  },
  {
    p: 35, tokens: 2,
    text: 'At Elea he set out two ways: that it is, and that it is not. He rejects the second — what-is-not can be neither known nor spoken. So only what-is is real, and change is a trick of the senses.',
    cite: 'Parmenides, On Nature',
    dur: 5.2,
  },
  {
    p: 0, tokens: 2,
    quote: {
      id: 'lq-metaphysics-being-4-1',
      text: 'You cannot know what is not — that is impossible — nor utter it.',
      author: 'Parmenides',
      work: 'On Nature, fragment 2',
      era: 'c. 475 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.2,
  },
  {
    p: 15, tokens: 3,
    text: 'Follow it and the world freezes. Change would mean passing into or out of non-being — but that path is barred. So motion itself dissolves into illusion. Aristotle later loosened the knot.',
    cite: 'Change becomes impossible',
    dur: 5.0,
  },
  {
    p: 4, tokens: 3,
    mc: {
      prompt: 'Why did Parmenides claim that non-being cannot exist?',
      options: [
        { id: 'a', text: 'Scientists had proven empty space is full', correct: false },
        { id: 'b', text: 'To think or speak of non-being is to make it a something', correct: true },
        { id: 'c', text: 'Nothingness is too small to measure', correct: false },
        { id: 'd', text: 'The gods filled creation, leaving no room for nothing', correct: false },
      ],
      explain:
        'Every thought and word needs an object. "It is not" fails because what-is-not can be neither known nor said: try to think it, and you quietly convert it into a something.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, tokens: 3,
    mc: {
      prompt: 'Physics talks about vacuums and empty space. Doesn’t that prove "nothing" really exists?',
      options: [
        { id: 'a', text: 'Yes — a vacuum is a region of pure nothingness', correct: false },
        { id: 'b', text: 'Yes — empty space is the "nothing" Parmenides denied', correct: false },
        { id: 'c', text: 'No — a vacuum is still a something: a region with properties', correct: true },
        { id: 'd', text: 'No — because vacuums are impossible to create', correct: false },
      ],
      explain:
        'A vacuum is empty space — still a something with dimensions and quantum fields. Parmenides’ "nothing" is the total absence of any thing, which a vacuum never delivers.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Trap of Non-Being',
      points: [
        'Naming nothing seems to make it something',
        'Parmenides: what-is-not cannot be thought',
        'His logic implies change is illusion',
        'Aristotle split "being" into many senses',
      ],
      closing: 'Nothing looks like the simplest idea going, yet it stays one of philosophy’s slipperiest.',
    },
    dur: 2.8,
  },
];
