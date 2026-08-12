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
    text: 'You say you "know" it. But what is knowing? Epistemology is the study of that question — Plato pressed it first, in the Theaetetus.',
    dur: 4.2,
  },
  {
    hpose: 3,
    locks: [1, 1, 1],
    text: 'The standard recipe has three locks. The claim is TRUE. You BELIEVE it. And you have JUSTIFICATION — solid reasons. Turn all three and the door opens: you know.',
    dur: 4.8,
  },
  {
    hpose: 2,
    locks: [1, 1, 1],
    text: 'Strip the reasons and it collapses. A true belief held for no reason is luck wearing a disguise. Justification ties your belief to the truth on purpose.',
    dur: 4.4,
  },
  {
    hpose: 4,
    locks: [1, 1, 0],
    text: 'In the Theaetetus, Socrates makes the case: a jury talked into a true verdict still does not KNOW — they never witnessed it. True belief, but no account. Two locks turn; the door holds.',
    cite: 'Plato, Theaetetus 201a–c, c. 369 BCE',
    dur: 4.8,
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
      prompt: 'In the standard analysis, which THREE things does genuine knowledge require?',
      cards: [
        { text: 'Justified true belief', correct: true },
        { text: 'Confident, popular, and true', correct: false },
      ],
      explain: 'The recipe is justified true belief. Confidence and popularity are not justification, however convincing they feel — only reasons turn the third lock.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 5,
    locks: [1, 1, 0],
    qkey: 'q2',
    interact: {
      prompt: 'You are 100% certain it will rain tomorrow, and it does. Did you KNOW it would rain?',
      cards: [
        { text: 'Only with good reasons', correct: true },
        { text: 'Yes, you were certain', correct: false },
      ],
      explain: 'Certainty is a feeling, not justification. True and believed, but the reasons lock never turned — being right without reasons is luck, and the door stays shut.',
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
