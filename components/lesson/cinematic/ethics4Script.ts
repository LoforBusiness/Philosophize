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
}

export const BEATS: Ethics4Beat[] = [
  {
    a: 1, b: 8, floor: 0, rows: 1,
    text: 'Cultures disagree about right and wrong. That much is just a fact. Saying there is no right answer underneath the disagreement is a much bigger claim, and a separate one.',
    dur: 3.8,
  },
  {
    a: 2, b: 10, rows: 2,
    text: 'First the harmless fact. Societies really do hold very different codes. The bold claim goes further. Whether something is right depends on the group asking, and there is no answer underneath. Sliding from the first to the second is the classic mistake.',
    cite: 'Two kinds of relativism',
    dur: 5.4,
  },
  {
    a: 4, b: 35, rows: 3,
    text: 'Ruth Benedict pressed the bold claim: what a society calls "good" simply tracks what it has come to approve. Morality, she held, is a name for socially approved habits.',
    cite: 'Ruth Benedict, 1934',
    dur: 4.6,
  },
  {
    a: 4, b: 0, rows: 3,
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
    a: 13, b: 15, rows: 3,
    text: 'The objectivist fires back: some truths hold whatever a culture says. Torturing a child for fun is wrong — full stop. Cultures differing does not make every code equally true.',
    cite: 'Moral objectivism',
    dur: 4.8,
  },
  {
    a: 38, b: 38, floor: 1, rows: 3,
    text: 'And look down. Donald Brown went through every society on record and found the same handful of things in all of them. Fairness. Returning a favour. Bans on murder and incest. A shared floor, under feet that thought they stood apart.',
    cite: 'Donald Brown, Human Universals, 1991',
    dur: 5.0,
  },
  {
    a: 21, b: 0, floor: 1, rows: 3,
    interact: {
      prompt: 'Drag to what this kind of relativism claims.',
      drag: {
        lo: 'CULTURES SIMPLY DIFFER',
        hi: 'NOTHING IS RIGHT OR WRONG',
        start: 0,
        zones: [
          { id: 'differ', upto: 0.3, reads: 'cultures disagree, and one of them may still be right' },
          { id: 'relative', upto: 0.74, reads: 'true for a group, with no view standing above them', correct: true },
          { id: 'none', upto: 1, reads: 'nothing is right or wrong, even inside a group' },
        ],
      },
      explain: 'The middle, and both ends are easy to mistake for it. The near end is just an observation, and anybody can agree with it. The far end says nothing is ever right or wrong. This view does not: inside a group there are still right answers.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    a: 8, b: 4, floor: 1, rows: 3,
    interact: {
      prompt: 'If every culture sets its own rules, must each one tolerate the rest?',
      explain:
        'It sounds open-minded, and it backfires. If every value is only local, then "tolerance suits us" can never grow into "everyone must be tolerant." A rule for everybody is exactly what this view cannot give you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'One Morality or Many?',
      points: [
        'Cultures differ is not yet "no moral truth"',
        'Objectivism: some truths hold beyond culture',
        'Brown found a shared moral floor',
        'Tolerance does not follow from relativism',
      ],
      closing: 'Understanding a culture is not giving up judgement. It is judging with open eyes and a longer look.',
    },
    dur: 2.8,
  },
];
