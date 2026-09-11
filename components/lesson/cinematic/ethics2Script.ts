import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-2, "Three Lenses on a Small Choice".
// A found wallet on the pavement; a guide walks in and tries each of the three
// ethical lenses on it — Mill (weigh the outcome), Kant (point to a universal
// law), Aristotle (a hand to the heart) — while the finder deliberates. Every
// beat uses a DIFFERENT gesture so the figures never loop.
//
// Both graded questions come from data/.../everyday-moral-choices.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics2Beat extends BaseBeat {
  /** Finder gesture (emote code). */ p?: number;
  /** Guide gesture (emote code), -1 = off stage. */ g?: number;
  /** Guide x (walks between beats). */ gx?: number;
  /** Verdict-board rows carry their lens name + question yet (0/1). */ named?: number;
  /** How many of the three lenses have stamped their verdict, 0→3. */ lens?: number;
}

export const BEATS: Ethics2Beat[] = [
  {
    p: 12, x: 258, g: -1,
    text: 'You find a wallet on the pavement. Now what?',
    dur: 1.8,
  },
  {
    p: 12, x: 258, g: -1,
    text: 'One small choice is about to get three different verdicts.',
    dur: 1.8,
  },
  {
    p: 7, x: 262, g: -1, gx: 48, named: 1,
    // Nothing on this stage is labelled "Deontology", and the next three beats show
    // each lens by working the wallet through it. Naming all three first was a
    // vocabulary tax paid before any of them meant anything (J6).
    text: 'Ethics hands you three lenses. One asks what happens next.',
    cite: 'Three lenses',
    dur: 1.9,
  },
  {
    p: 7, x: 262, g: -1, gx: 48, named: 1,
    // Nothing on this stage is labelled "Deontology", and the next three beats show
    // each lens by working the wallet through it. Naming all three first was a
    // vocabulary tax paid before any of them meant anything (J6).
    text: 'One asks what your duty is. One asks who the act turns you into.',
    dur: 2.1,
  },
  {
    p: 7, x: 262, g: -1, gx: 48, named: 1,
    // Nothing on this stage is labelled "Deontology", and the next three beats show
    // each lens by working the wallet through it. Naming all three first was a
    // vocabulary tax paid before any of them meant anything (J6).
    text: 'Most people use all three without noticing.',
    dur: 1.8,
  },
  {
    p: 160, x: 262, g: 21, gx: 108, named: 1, lens: 1,
    text: 'Mill points the first lens at the wallet. Did handing it in make anyone’s life go better?',
    cite: 'J.S. Mill, Utilitarianism, 1863',
    dur: 2.7,
  },
  {
    p: 416, x: 262, g: 21, gx: 108, named: 1, lens: 1,
    text: 'For him that’s the whole question, and everybody’s happiness counts the same.',
    dur: 2.1,
  },
  {
    p: 0, x: 262, g: 1, gx: 108, named: 1, lens: 1,
    quote: {
      id: 'lq-ethics-ethics-2-1',
      text: 'Actions are right in proportion as they tend to promote happiness, wrong as they tend to produce the reverse of happiness.',
      author: 'John Stuart Mill',
      philosopherId: 'john-stuart-mill',
      work: 'Utilitarianism',
      era: '1863',
      branchSlugs: ['ethics'],
    },
    dur: 3.0,
  },
  {
    p: 14, x: 262, g: 6, gx: 108, named: 1, lens: 2,
    text: 'Kant ignores the happy ending. He says to act only on a rule you could want everyone to follow.',
    cite: 'Kant, Groundwork, 1785',
    dur: 2.3,
  },
  {
    p: 14, x: 262, g: 6, gx: 108, named: 1, lens: 2,
    text: 'Try Kant’s test on the rule “keep any wallet you find”. It eats itself, because nobody would hand one in.',
    dur: 2.5,
  },
  {
    p: 13, x: 262, g: 22, gx: 108, named: 1, lens: 3,
    text: 'Aristotle asks a third question. Not what to do, but who you’re becoming.',
    cite: 'Aristotle, Nicomachean Ethics',
    dur: 1.8,
  },
  {
    p: 13, x: 262, g: 22, gx: 108, named: 1, lens: 3,
    text: 'Every honest act makes the next one easier. That’s what he means by a good life.',
    dur: 3.3,
  },
  {
    p: 21, x: 262, g: -1, named: 1, lens: 3,
    interact: {
      // The table on stage calls this lens OUTCOMES, not "consequentialist".
      prompt: 'Tap the question the OUTCOMES lens asks about that wallet.',
      cards: [
        { text: 'Which brings most happiness', correct: true },
        { text: 'Could everyone follow it', correct: false },
      ],
      explain: '“Which brings most happiness.” That question weighs results and nothing else — whose life got better, whose got worse. The other card is Kant’s question, and it doesn’t care how the story ends.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 8, x: 262, g: -1, named: 1, lens: 3,
    interact: {
      prompt: 'Does being common or being legal settle whether it is right?',
      sort: {
        chip: 'common and legal',
        bins: [
          { id: 'common', label: 'common settles it', reads: 'common, so it must be fine' },
          { id: 'legal', label: 'legal settles it', reads: 'legal, so it must be fine' },
          { id: 'neither', label: 'neither does', reads: 'neither one settles whether it is right', correct: true },
        ],
      },
      explain: 'Neither does. Hume pointed at this gap in 1739. What people do never tells you, by itself, what they ought to do. The other two settings step over the gap and hope nobody notices.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'One Choice, Three Lenses',
      points: [
        'Outcomes: ask what result helps most (Mill)',
        'Duty: ask if your maxim could be universal (Kant)',
        'Character: ask who the act makes you (Aristotle)',
        '"Natural" never proves "right" (the is–ought gap)',
      ],
      closing: 'The lenses rarely agree, and the disagreement is where real thinking starts.',
    },
    dur: 2.8,
  },
];
