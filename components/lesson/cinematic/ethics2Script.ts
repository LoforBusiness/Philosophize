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
    text: 'You find a wallet on the pavement. Now what? One small choice is about to get three different verdicts.',
    dur: 3.4,
  },
  {
    p: 7, x: 262, g: -1, gx: 48, named: 1,
    text: 'Ethics hands you three lenses, not three religions. Consequentialism weighs results. Deontology asks about duty. Virtue ethics asks who the act makes you. Most of us quietly blend all three.',
    cite: 'Three lenses',
    dur: 5.0,
  },
  {
    p: 4, x: 262, g: 21, gx: 108, named: 1, lens: 1,
    text: 'Mill points the first lens at the wallet: did returning it make life go better? Acts are right, he says, as they tend to promote happiness — everyone weighed equally.',
    cite: 'J.S. Mill, Utilitarianism, 1863',
    dur: 4.8,
  },
  {
    p: 0, x: 262, g: 1, gx: 108, named: 1, lens: 1,
    quote: {
      id: 'lq-ethics-ethics-2-1',
      text: 'Actions are right in proportion as they tend to promote happiness, wrong as they tend to produce the reverse of happiness.',
      author: 'John Stuart Mill',
      work: 'Utilitarianism',
      era: '1863',
      branchSlugs: ['ethics'],
    },
    dur: 3.0,
  },
  {
    p: 14, x: 262, g: 6, gx: 108, named: 1, lens: 2,
    text: 'Kant ignores the happy ending. Act only on a rule you could will everyone to follow — and "keep wallets you find" self-destructs, because trust in returning things would collapse.',
    cite: 'Kant, Groundwork, 1785',
    dur: 4.8,
  },
  {
    p: 13, x: 262, g: 22, gx: 108, named: 1, lens: 3,
    text: 'Aristotle asks a third question — not "what do I do?" but "who am I becoming?" Each honest act, done as habit, makes the next one easier. That is the road to a flourishing life.',
    cite: 'Aristotle, Nicomachean Ethics',
    dur: 4.8,
  },
  {
    p: 21, x: 262, g: -1, named: 1, lens: 3,
    interact: {
      prompt: 'Returning the found wallet, which question does a consequentialist ask first?',
      cards: [
        { text: 'Which brings most happiness', correct: true },
        { text: 'Could everyone follow it', correct: false },
      ],
      explain: 'Consequentialism weighs results — whose happiness rises or falls. The universalizing question is Kant’s, the honest-person question is Aristotle’s, and law is not the same as morality.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 8, x: 262, g: -1, named: 1, lens: 3,
    interact: {
      prompt: 'Almost everyone keeps small change they find, so keeping the wallet must be morally fine. Sound reasoning?',
      cards: [
        { text: 'False', correct: true },
        { text: 'True', correct: false },
      ],
      explain: 'This is the is–ought gap Hume flagged in 1739: what people commonly do never, by itself, proves what is right.',
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
