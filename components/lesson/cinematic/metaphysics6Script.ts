import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-6, "Can a Thing Survive Change?" — the Ship of Theseus.
// A shipwright swaps rotted planks for new ones, one by one, until no original wood
// remains. Then someone rebuilds a second ship from the old planks — and both have a
// claim. Questions stay A/B/C/D (they're nuanced), the SCENE carries the wonder.

export interface Meta6Beat extends BaseBeat {
  /** Shipwright gesture. */ p?: number;
  /** Plank-swapping intensity 0..1 — drives the working shimmer on the hull. */ swap?: number;
  /** The second ship (rebuilt from old planks) is shown 0..1. */ two?: number;
  /**
   * Fraction of ORIGINAL wood still in the sailing hull, 1 → 0. Drives the chart
   * across the top of the stage and how far each hull course has been re-planked.
   * Monotonically falling, so the graph only ever draws forward.
   */
  orig?: number;
}

export const BEATS: Meta6Beat[] = [
  {
    p: 2, swap: 0, two: 0, orig: 1,
    text: 'Swap every plank of a ship, one at a time. When none of the first wood is left — is it the same ship, or a new one?',
    dur: 3.6,
  },
  {
    p: 36, swap: 1, orig: 0.06,
    text: 'Athens kept Theseus’s ship for centuries, replacing each rotted plank with a fresh one. In the end, not one original board remained. Plutarch reports the quarrel it started.',
    cite: 'The Ship of Theseus',
    dur: 5.0,
  },
  {
    p: 0, swap: 1, orig: 0,
    quote: {
      id: 'lq-metaphysics-being-6-1',
      text: 'All things move and nothing remains still; you cannot step twice into the same stream.',
      author: 'Heraclitus',
      work: 'Plato, Cratylus 402a',
      era: 'c. 500 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 1, swap: 1, orig: 0,
    text: 'Philosophers split the word "same." Qualitative identity: sharing all the same features. Numerical identity: being one and the same thing over time. The ship can lose the first while keeping the second.',
    cite: 'Two senses of sameness',
    dur: 5.2,
  },
  {
    p: 22, swap: 1, orig: 0,
    text: 'And you are the living proof. Almost every cell in your body has been replaced since childhood — the toddler in old photos shares barely any matter with you. Yet you call that child yourself.',
    cite: 'Your own riddle',
    dur: 5.0,
  },
  {
    p: 4, swap: 1, orig: 0,
    mc: {
      prompt: 'Why does the Ship of Theseus threaten our idea of identity over time?',
      options: [
        { id: 'a', text: 'Wooden ships rot too quickly to last', correct: false },
        { id: 'b', text: 'A thing’s parts can all change while we still call it the same thing', correct: true },
        { id: 'c', text: 'Theseus never actually owned a ship', correct: false },
        { id: 'd', text: 'Ships cannot be repaired without sinking', correct: false },
      ],
      explain: 'If a thing keeps its identity after every part is replaced, identity cannot rest on the parts alone — which is exactly what makes the case so puzzling.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 5, swap: 0.4, two: 1, orig: 0,
    mc: {
      prompt: 'Someone hoards the old planks and rebuilds them into a ship. Which one is the real Ship of Theseus?',
      options: [
        { id: 'a', text: 'The rebuilt one — it has the original matter', correct: false },
        { id: 'b', text: 'The repaired one — it never stopped sailing', correct: false },
        { id: 'c', text: 'No automatic answer: "same" depends on tracking matter or continuity', correct: true },
        { id: 'd', text: 'Both are fakes, since neither is unchanged', correct: false },
      ],
      explain: 'Each ship has a strong claim — one keeps the original matter, the other unbroken continuity — so identity depends on which criterion we choose, not on a single fact.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Identity Is Stranger Than It Looks',
      points: [
        'Theseus’s ship: parts replaced, identity questioned',
        'Qualitative versus numerical sameness',
        'Heraclitus: all things flow',
        'You change matter yet stay you',
      ],
      closing: 'Maybe a thing is not its stuff but its story — the unbroken thread tying each stage to the next.',
    },
    dur: 2.8,
  },
];
