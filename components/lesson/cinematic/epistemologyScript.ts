import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-1, "What Does It Mean to Know?"
// Theme: THE DOOR WITH THREE LOCKS.
//
// Knowledge is a door held by three locks — it is TRUE, you BELIEVE it, and you
// have JUSTIFICATION. Turn all three and it opens. A lucky guess turns true and
// belief, but the justification lock never moves, so the door stays shut — being
// right by luck is not knowing.
//
// Both graded questions come from data/.../what-does-it-mean-to-know.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface EpistBeat extends BaseBeat {
  /** Seeker pose: 0 stand · 2 present · 3 count · 4 reflect · 5 reach-to-turn-a-key. */
  hpose?: number;
  /** Target lit level of the three locks [true, belief, justification], 0..1. */
  locks?: [number, number, number];
  /** This beat's correct answer turns the justification key (q1) or proves luck (q2). */
  qkey?: 'q1' | 'q2';
}

export const BEATS: EpistBeat[] = [
  {
    hpose: 2,
    locks: [0.25, 0.25, 0.25],
    text: 'You say you know it. But what is knowing?',
    dur: 1.8,
  },
  {
    hpose: 2,
    locks: [0.25, 0.25, 0.25],
    text: 'That question is the whole of epistemology, and Plato was already pressing it in the Theaetetus.',
    dur: 2.7,
  },
  {
    hpose: 3,
    locks: [1, 1, 1],
    text: 'The standard recipe has three locks. The claim is TRUE.',
    dur: 1.8,
  },
  {
    hpose: 3,
    locks: [1, 1, 1],
    text: 'You BELIEVE it. And you have JUSTIFICATION — solid reasons.',
    dur: 1.8,
  },
  {
    hpose: 3,
    locks: [1, 1, 1],
    text: 'Turn all three and the door opens: you know.',
    dur: 1.8,
  },
  {
    hpose: 2,
    locks: [1, 1, 1],
    text: 'Strip the reasons and it collapses. A true belief held for no reason is luck wearing a disguise.',
    dur: 2.9,
  },
  {
    hpose: 2,
    locks: [1, 1, 1],
    text: 'Justification ties your belief to the truth on purpose.',
    dur: 1.8,
  },
  {
    hpose: 4,
    locks: [1, 1, 0],
    text: 'Socrates makes the case with a jury. The jurors are talked into a verdict that happens to be true, and never saw a thing.',
    cite: 'Plato, Theaetetus 201a–c, c. 369 BCE',
    dur: 3.8,
  },
  {
    hpose: 4,
    locks: [1, 1, 0],
    text: 'Two locks turn. The door holds.',
    dur: 1.8,
  },
  {
    hpose: 0,
    locks: [1, 1, 0],
    quote: {
      id: 'lq-epistemology-knowledge-1-1',
      text: 'What I do not know I do not think I know either.',
      author: 'Socrates (in Plato)',
      work: 'Plato, Apology',
      era: '21d',
      philosopherId: 'socrates',
      branchSlugs: ['epistemology'],
    },
    dur: 2.6,
  },
  {
    hpose: 5,
    locks: [1, 1, 0.15],
    qkey: 'q1',
    interact: {
      prompt: 'So what does it actually take to know something?',
      cards: [
        { text: 'Justified true belief', correct: true },
        { text: 'Confident, popular, and true', correct: false },
      ],
      explain: 'The recipe is justified true belief. Feeling sure is not a reason, and neither is a crowd agreeing. Only reasons turn the third lock.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 5,
    locks: [1, 1, 0],
    qkey: 'q2',
    interact: {
      prompt: 'Drag to what turns a true belief into knowledge.',
      drag: {
        lo: 'NO REASONS AT ALL',
        hi: 'REASONS ANYONE COULD CHECK',
        start: 0,
        zones: [
          { id: 'hunch', upto: 0.3, reads: 'a hunch that happened to land: lucky, not knowledge' },
          { id: 'sure', upto: 0.66, reads: 'a strong feeling, which is not a reason' },
          { id: 'know', upto: 1, reads: 'reasons anyone could check, and now it is knowledge', correct: true },
        ],
      },
      explain: 'Only the far end. Notice what never moved the knob: being a hundred per cent certain. Certainty is a feeling and the third lock takes reasons. True, believed, and right by luck leaves the door shut.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Knowing vs. Believing',
      points: [
        'Epistemology is the study of knowledge',
        'The recipe: justified true belief',
        'Plato’s Theaetetus demanded an account',
        'Justification turns luck into knowing',
      ],
      closing: 'Next time you say "I know," ask what justification actually backs it up.',
    },
    dur: 2.8,
  },
];
