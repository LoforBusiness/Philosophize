import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-1, "What Does It Mean to Know?"
// Theme: AN EVIDENCE BOARD IN A COURTROOM, TIED WITH RED STRING.
//
// Knowledge is an evidence board: three cards pinned to it — TRUE, BELIEF and
// REASONS — and a red string that ties the belief through its reasons to the truth.
// Plato's jurors are talked round by an advocate: the REASONS card falls, the string
// goes slack, and the board is stamped JUST LUCK.
//
// Redrawn 2026-09-25 after the logic debate studio. The narration is unchanged; the
// first question moved onto the stage, where the reader picks the card that would
// make the jurors' true belief knowledge.
// ─────────────────────────────────────────────────────────────────────────────

export interface EpistBeat extends BaseBeat {
  /** Seeker pose: 0 stand · 2 present · 3 count · 4 reflect · 5 reach-to-turn-a-key. */
  hpose?: number;
  /** Which cards are pinned to the board [true, belief, reasons]: 1 pinned, below 0.9 not. */
  locks?: [number, number, number];
  /** This beat's correct answer turns the justification key (q1) or proves luck (q2). */
  qkey?: 'q1' | 'q2';
  /** The sign over the gate names the field that studies it: EPISTEMOLOGY. */
  field?: boolean;
  /** The board has been judged: stamped KNOWLEDGE with all three cards, JUST LUCK without REASONS. */
  opens?: boolean;
  /** Justification ties belief to truth: the red string runs from BELIEF through REASONS to TRUE. */
  tie?: boolean;
  /** Being persuaded is pinned in the REASONS slot, and struck out. */
  persuaded?: boolean;
  /** The third card, REASONS, is ringed: the condition the next beats are about. */
  third?: boolean;
  /** The question is asked ON THE STAGE: three loose cards on the easel's shelf. */
  pick?: boolean;
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
    pick: true,
    interact: {
      prompt: 'The jurors’ verdict was true, and they believed it. Which card would make it knowledge?',
      explain: 'Good reasons. The jurors already had truth and belief. Feeling certain isn’t a reason, and a whole jury can agree without good grounds. Justification is what turns a true belief into knowledge.',
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
