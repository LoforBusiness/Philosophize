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
  /** The sign over the gate names the field that studies it: EPISTEMOLOGY. */
  field?: boolean;
  /** All three conditions together are sufficient: with every lock turned, the door opens. */
  opens?: boolean;
  /** Justification ties belief to truth: a rod couples the three bolts while REASONS is turned. */
  tie?: boolean;
  /** Being persuaded is tried as the reason, and struck out under REASONS. */
  persuaded?: boolean;
  /** The third lock, REASONS, is ringed: the condition the next beats are about. */
  third?: boolean;
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
    field: true,
    text: 'Epistemology is the branch of philosophy that studies knowledge. Plato examined this question in his dialogue the Theaetetus.',
    dur: 2.7,
  },
  {
    // Only TRUE turns here: the sentence names the first condition alone.
    hpose: 3,
    locks: [1, 0.25, 0.25],
    field: true,
    text: 'The traditional analysis sets three conditions for knowledge. The first is truth: what you believe must be true.',
    dur: 1.8,
  },
  {
    // BELIEF and then REASONS, the second and the third.
    hpose: 3,
    locks: [1, 1, 1],
    field: true,
    text: 'The second is belief: you must accept the claim. The third is justification: you must have good reasons for it.',
    dur: 1.8,
  },
  {
    // All three are turned, and together they are enough: the door opens.
    hpose: 3,
    locks: [1, 1, 1],
    field: true,
    opens: true,
    text: 'A belief that meets all three conditions is knowledge. Each condition is necessary, and the three together are sufficient.',
    dur: 1.8,
  },
  {
    hpose: 2,
    locks: [1, 1, 1],
    field: true,
    opens: true,
    third: true,
    text: 'Without the third condition, a true belief could be held for no reason at all. It would then be correct only by luck.',
    dur: 2.9,
  },
  {
    hpose: 2,
    locks: [1, 1, 1],
    field: true,
    opens: true,
    tie: true,
    third: true,
    text: 'Justification is meant to connect a belief to the truth, so that being right isn’t a matter of luck.',
    dur: 1.8,
  },
  {
    hpose: 4,
    locks: [1, 1, 0],
    field: true,
    opens: true,
    tie: true,
    third: true,
    text: 'In the Theaetetus, Socrates describes jurors persuaded by skilled speakers. Their verdict is true, but they never witnessed what happened.',
    cite: 'Plato, Theaetetus 201a–c',
    dur: 3.8,
  },
  {
    hpose: 4,
    locks: [1, 1, 0],
    field: true,
    opens: true,
    tie: true,
    third: true,
    persuaded: true,
    text: 'The jurors believe what’s true. But being persuaded is no good reason, so the jurors lack knowledge.',
    dur: 1.8,
  },
  {
    hpose: 0,
    locks: [1, 1, 0],
    field: true,
    opens: true,
    tie: true,
    third: true,
    persuaded: true,
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
    field: true,
    opens: true,
    tie: true,
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
    field: true,
    opens: true,
    tie: true,
    qkey: 'q2',
    interact: {
      prompt: 'Put these in order, from least supported to best.',
      order: {
        axis: 'LEAST SUPPORT FIRST',
        items: [
          { id: 'guess', reads: 'A LUCKY GUESS' },
          { id: 'weak', reads: 'SOME GROUNDS, TOO WEAK' },
          { id: 'know', reads: 'STRONG REASONS' },
        ],
      },
      explain: 'Only the last is knowledge. A true belief can be arrived at by luck or held on grounds that don\'t carry it, and neither is knowing. What the third adds is support strong enough that being right isn\'t an accident.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    field: true,
    opens: true,
    tie: true,
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
