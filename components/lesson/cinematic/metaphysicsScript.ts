import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-1, "Why Does Anything Exist?"
// Theme: ERASING THE WORLD TO REACH NOTHING.
//
// A figure under a full sky tries to think his way to pure nothing — he wipes the
// stars away, but a dark void is still something; nothing slips his grip. Then
// science's chain of "because ←" links recedes forever, each state explained by an
// earlier one, never reaching a floor.
//
// Both graded questions come from data/.../why-does-anything-exist.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface MetaBeat extends BaseBeat {
  /** Figure pose: 0 stand · 1 emphatic (wipe) · 2 present · 6 gaze up. */
  hpose?: number;
  /** How much of the sky is erased, 0 (full) → 1 (void). */
  erase?: number;
  /** Leibniz's principle of sufficient reason, carded over the question it forces. */
  rule?: boolean;
  /** The causal chain of "because ←" links is on stage. */
  chain?: boolean;
  /** This beat's answer pushes the regress further. */
  qregress?: 'q1' | 'q2';
}

export const BEATS: MetaBeat[] = [
  {
    hpose: 6,
    text: 'Why is there something rather than nothing? Metaphysics’ most famous question. Brace yourself.',
    dur: 3.4,
  },
  {
    hpose: 2,
    rule: true,
    text: 'In 1714, Leibniz argued nothing is true without a sufficient reason. Apply that to everything at once: why this crowded universe instead of an empty one? Nothing, he said, would have been simpler.',
    cite: 'Leibniz, Principles of Nature and Grace §7',
    dur: 4.8,
  },
  {
    hpose: 0,
    rule: true,
    quote: {
      id: 'lq-metaphysics-being-1-1',
      text: 'Why is there something rather than nothing? For nothing is simpler and easier than something.',
      author: 'Gottfried Leibniz',
      work: 'Principles of Nature and Grace',
      era: '1714',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.0,
  },
  {
    hpose: 1,
    erase: 0.86,
    text: 'Try to reach it. Parmenides did: strip away objects, space, time, physics — and a dark void is still something. "What is not" can be neither thought nor spoken. Pure nothing slips your grip.',
    cite: 'Parmenides, On Nature, early 5th c. BCE',
    dur: 5.0,
  },
  {
    hpose: 2,
    chain: true,
    text: 'Science never even tries. It starts mid-game, explaining one state of the world by an earlier one — and it presumes there are laws and states at all.',
    dur: 4.4,
  },
  {
    hpose: 2,
    chain: true,
    qregress: 'q1',
    mc: {
      prompt: 'Why can’t science fully answer why anything exists at all?',
      options: [
        { id: 'a', text: 'The Big Bang has already settled the matter', correct: false },
        { id: 'b', text: 'Science presumes things exist; it cannot account for existence itself', correct: true },
        { id: 'c', text: 'Scientists simply aren’t clever enough yet', correct: false },
        { id: 'd', text: 'The question is too brief to be scientific', correct: false },
      ],
      explain:
        'Science explains each state by a prior state and the laws. It presupposes there are laws and states at all — so it never reaches why there is anything to begin with.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 4,
    chain: true,
    qregress: 'q2',
    mc: {
      prompt: 'The Big Bang explains where the universe came from. Doesn’t that answer Leibniz’s question?',
      options: [
        { id: 'a', text: 'Yes — the Big Bang is the reason there is something', correct: false },
        { id: 'b', text: 'Yes, once we find what caused the Big Bang', correct: false },
        { id: 'c', text: 'No — it describes an early state, still presupposing something existed', correct: true },
        { id: 'd', text: 'No, because the Big Bang never actually happened', correct: false },
      ],
      explain:
        'The Big Bang describes how an existing universe evolved from a dense early state. It assumes that state already was — so it cannot say why there is anything rather than nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Why Existence Is a Puzzle',
      points: [
        'Leibniz: nothing exists without a reason',
        'So why something rather than nothing?',
        'Parmenides: pure nothing can’t be thought',
        'Science explains how, not why',
      ],
      closing: 'Even the ground beneath you now demands an explanation.',
    },
    dur: 2.8,
  },
];
