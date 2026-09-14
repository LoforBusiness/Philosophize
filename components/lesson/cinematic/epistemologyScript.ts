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
    text: 'You claim to know many things. But what separates knowing something from merely believing it?',
    dur: 1.8,
  },
  {
    hpose: 2,
    locks: [0.25, 0.25, 0.25],
    text: 'Epistemology is the branch of philosophy that studies knowledge. Plato examined this question in his dialogue the Theaetetus.',
    dur: 2.7,
  },
  {
    hpose: 3,
    locks: [1, 1, 1],
    text: 'The traditional analysis sets three conditions for knowledge. The first is truth: what you believe must be true.',
    dur: 1.8,
  },
  {
    hpose: 3,
    locks: [1, 1, 1],
    text: 'The second is belief: you must accept the claim. The third is justification: you must have good reasons for it.',
    dur: 1.8,
  },
  {
    hpose: 3,
    locks: [1, 1, 1],
    text: 'A belief that meets all three conditions is knowledge. Each condition is necessary, and the three together are sufficient.',
    dur: 1.8,
  },
  {
    hpose: 2,
    locks: [1, 1, 1],
    text: 'Without the third condition, a true belief could be held for no reason at all. It would then be correct only by luck.',
    dur: 2.9,
  },
  {
    hpose: 2,
    locks: [1, 1, 1],
    text: 'Justification is meant to connect a belief to the truth, so that being right isn’t a matter of luck.',
    dur: 1.8,
  },
  {
    hpose: 4,
    locks: [1, 1, 0],
    text: 'In the Theaetetus, Socrates describes jurors persuaded by skilled speakers. Their verdict is true, but they never witnessed what happened.',
    cite: 'Plato, Theaetetus 201a–c',
    dur: 3.8,
  },
  {
    hpose: 4,
    locks: [1, 1, 0],
    text: 'The jurors believe what’s true. But being persuaded is no good reason, so the jurors lack knowledge.',
    dur: 1.8,
  },
  {
    hpose: 0,
    locks: [1, 1, 0],
    quote: {
      id: 'lq-epistemology-knowledge-1-1',
      text: 'What I do not know I do not think I know either.',
      author: 'Socrates (in Plato)',
      work: 'Plato, Apology 21d',
      era: 'c. 399 BCE',
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
      prompt: 'Which conditions together make a belief count as knowledge?',
      cards: [
        { text: 'Justified true belief', correct: true },
        { text: 'Certain, widely agreed, and true', correct: false },
      ],
      explain: 'Justified true belief. Feeling certain isn’t a reason, and a crowd can agree without good grounds. Knowledge needs a true belief supported by adequate reasons.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 5,
    locks: [1, 1, 0],
    qkey: 'q2',
    interact: {
      prompt: 'How much support must a true belief have to count as knowledge?',
      drag: {
        lo: 'NO REASONS AT ALL',
        hi: 'STRONG SUPPORTING REASONS',
        start: 0,
        zones: [
          { id: 'hunch', upto: 0.3, reads: 'a lucky guess, true yet not knowledge' },
          { id: 'sure', upto: 0.66, reads: 'some grounds, yet too weak to justify it' },
          { id: 'know', upto: 1, reads: 'strong reasons, so the belief is knowledge', correct: true },
        ],
      },
      explain: 'Strong reasons, so the belief is knowledge. Justification comes from reasons, not from how confident you feel. A true belief without adequate reasons is correct only by luck, so it isn’t knowledge.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Knowing Versus Believing',
      points: [
        'Epistemology is the study of knowledge',
        'Knowledge is traditionally analysed as justified true belief',
        'In the Theaetetus, true belief falls short of knowledge',
        'Justification separates knowing from being right by luck',
      ],
      closing: 'To claim knowledge is to claim good reasons, not only a true belief.',
    },
    dur: 2.8,
  },
];
