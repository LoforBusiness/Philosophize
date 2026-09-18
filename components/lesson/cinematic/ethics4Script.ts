import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-4, "Is Morality Universal or Relative?".
// The stage is a two-layer diagram. ABOVE the arguers hang two culture tablets —
// the SURFACE, where codes plainly differ (bury vs burn, covered vs bare, pork vs
// beef), revealed a row at a time. BELOW their feet the FLOOR lights up: Brown's
// human universals drawn as a bar chart whose every bar runs the full width, because
// every documented society has them. Two figures argue in the band between.
//
// Q1 is the deck's four-option question. Q2 is answered IN THE SCENE: two big verdict
// stamps replace the tablets, so the reader rules on the tolerance argument by tapping.
//
// Graded questions are the two from data/.../morality-across-cultures.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics4Beat extends BaseBeat {
  /** Left figure gesture. */ a?: number;
  /** Right figure gesture. */ b?: number;
  /** Shared moral floor lit (0/1) — drives the universals bar chart. */ floor?: number;
  /** How many rows of each culture's code are written up (0..3). */ rows?: number;
  /**
   * A one-shot annotation between the two tablets, timed to this beat's own
   * claim. 0 none · 1 "A STRONGER CLAIM?" (tentative, dashed) · 2 "MORAL
   * RELATIVISM" (the claim now named) · 3 "DOESN'T FOLLOW" (struck through,
   * the inference rejected) · 4 "WRONG EVERYWHERE" (boxed, the objectivist's
   * universal claim) · 5 FLAT/ROUND (the earth-shape analogy, FLAT struck) ·
   * 6 a bracket beside the three named universals on the floor chart ·
   * 7 a bridge linking the surface down toward the floor beneath it.
   */
  note?: number;
}

export const BEATS: Ethics4Beat[] = [
  {
    a: 167, b: 8, floor: 0, rows: 1,
    text: 'Cultures disagree about right and wrong. That disagreement is an observable fact.',
    dur: 1.8,
  },
  {
    a: 167, b: 8, floor: 0, rows: 1, note: 1,
    text: 'The claim that no correct answer lies behind the disagreement is much stronger, and logically separate.',
    dur: 2.3,
  },
  {
    a: 2, b: 10, rows: 2,
    text: 'The first claim is descriptive relativism: societies in fact hold different moral codes.',
    cite: 'Two kinds of relativism',
    dur: 1.8,
  },
  {
    a: 266, b: 161, rows: 2, note: 2,
    text: 'The second claim is moral relativism. It holds that rightness depends on a group’s code, with no higher standard.',
    dur: 2.9,
  },
  {
    a: 266, b: 161, rows: 2, note: 3,
    text: 'Inferring the second from the first is a common error. Disagreement doesn’t show there’s no answer.',
    dur: 1.8,
  },
  {
    a: 380, b: 35, rows: 3,
    text: 'The anthropologist Ruth Benedict defended relativism. For Benedict, a society calls good whatever it has come to approve.',
    cite: 'Ruth Benedict, 1934',
    dur: 4.6,
  },
  {
    a: 455, b: 0, rows: 3,
    quote: {
      id: 'lq-ethics-ethics-4-1',
      text: 'Morality differs in every society, and is a convenient term for socially approved habits.',
      author: 'Ruth Benedict',
      work: 'Patterns of Culture',
      era: '1934',
      branchSlugs: ['ethics'],
    },
    dur: 3.2,
  },
  {
    a: 13, b: 15, rows: 3, note: 4,
    text: 'Moral objectivists reply that some moral truths hold regardless of culture. Torturing a child for fun is wrong everywhere.',
    cite: 'Moral objectivism',
    dur: 3.4,
  },
  {
    a: 266, b: 258, rows: 3, note: 5,
    text: 'Cultures differing does not make every code equally true. Disagreement about the Earth’s shape didn’t make every answer true.',
    dur: 1.8,
  },
  {
    a: 38, b: 38, floor: 1, rows: 3,
    text: 'Donald Brown looked at cultures all over the world. He found things that every one of them shared, which he called human universals.',
    cite: 'Donald Brown, Human Universals, 1991',
    dur: 2.8,
  },
  {
    a: 266, b: 266, floor: 1, rows: 3, note: 6,
    text: 'Human universals include returning a favour, and forbidding murder and incest.',
    dur: 1.8,
  },
  {
    a: 266, b: 266, floor: 1, rows: 3, note: 7,
    text: 'These universals suggest a shared moral foundation beneath the differences between cultures.',
    dur: 1.8,
  },
  {
    a: 177, b: 0, floor: 1, rows: 3,
    interact: {
      prompt: 'What does moral relativism claim about right and wrong?',
      drag: {
        lo: 'CULTURES DIFFER IN BELIEF',
        hi: 'NOTHING IS RIGHT OR WRONG',
        start: 0,
        zones: [
          { id: 'differ', upto: 0.3, reads: 'cultures disagree, yet one may be correct' },
          { id: 'relative', upto: 0.74, reads: 'right relative to a group, with no higher standard', correct: true },
          { id: 'none', upto: 1, reads: 'nothing is right or wrong, even inside a group' },
        ],
      },
      explain: 'Moral relativism holds that right is relative to a group, with no higher standard. That cultures differ is only descriptive relativism, which an objectivist can accept. The claim that nothing is right or wrong is nihilism. Relativism still allows right answers within each group.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    a: 378, b: 4, floor: 1, rows: 3,
    interact: {
      prompt: 'Does it follow from moral relativism that every culture must tolerate the others?',
      explain:
        'It does not. If values hold only inside a culture, “we value tolerance” can’t become “all must tolerate”. Bernard Williams called that step inconsistent. Relativism can’t give every group the same duty.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'One Morality or Many?',
      points: [
        'That cultures differ doesn’t show there’s no moral truth',
        'Objectivism: some moral truths hold regardless of culture',
        'Brown found moral universals in every documented society',
        'Tolerance does not follow from relativism',
      ],
      closing: 'Understanding another culture doesn’t require giving up moral judgement. It requires judging with full knowledge of that culture.',
    },
    dur: 2.8,
  },
];
