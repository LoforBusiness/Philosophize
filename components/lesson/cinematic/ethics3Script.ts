import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-3, "What Makes an Action Good?" — the trolley problem.
// Theme: A SIGNAL BOX, A POINTS LEVER, A BALANCE, A RULE BOOK AND A MIRROR.
//
// He works a signal box. On the track diagram a runaway's lamp comes down the line
// towards five; the points lever in the floor would send it up a branch towards one.
// Mill's balance is on a desk, Kant's rule book is on a lectern, and a mirror hangs on
// the wall for Aristotle. He pulls the lever with both hands for Mill, and five weights
// outweigh one on the balance; he pushes it back for Kant and opens the rule book; he
// turns to the mirror for Aristotle. The runaway's lamp never reaches anyone.
//
// Redrawn 2026-09-26, the third lesson of the branch in reading order. Every line,
// citation, quotation and summary point is copied from the previous script by a
// generator, word for word and beat for beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics3Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 78 at the points lever · 84 at the end of the balance · 226 at the lectern · 318 at the mirror. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'power' | 'names' | 'run' | 'route' | 'ask' | 'pull' | 'weigh' | 'reset' | 'read' | 'mirror' | 'wise';
  /** The track diagram is lit. */ board?: boolean;
  /** The three names are on their plates: the desk, the lectern, the mirror. */ names?: boolean;
  /** The runaway's lamp is on the line, stopped short of the points. */ runaway?: boolean;
  /** The branch to the one is marked on the diagram. */ route?: boolean;
  /** The points lever is pulled and the points set for the branch. */ pulled?: boolean;
  /** Five weights and one are on the balance's pans. */ weights?: boolean;
  /** The rule book is open. */ open?: boolean;
  /** His reflection is in the mirror. */ reflect?: boolean;
  /** How many plates carry their second line: 1 5 LIVES > 1 · 2 DIGNITY · 3 PHRONESIS. */ gloss?: number;
  /** Q2 on the stage: the two lamps are labelled TRUE and FALSE. */ lamps?: boolean;
}

export const BEATS: Ethics3Beat[] = [
  {
    p: 158, x: 78, act: 'power', board: true,
    text: 'Consider one moral choice, judged by three philosophers.',
    dur: 1.8,
  },
  {
    p: 167, x: 78, act: 'names', board: true, names: true,
    text: 'All three seek the right action, yet their verdicts differ.',
    dur: 2.4,
  },
  {
    p: 158, x: 78, act: 'run', board: true, names: true, runaway: true,
    text: 'Suppose a runaway trolley is heading towards five people on the track. You stand beside a lever.',
    cite: 'Foot, 1967 · Thomson, 1976',
    dur: 2.5,
  },
  {
    p: 158, x: 78, act: 'route', board: true, names: true, runaway: true, route: true,
    text: 'If you pull it, the trolley switches to a side track, where it will kill one person instead.',
    dur: 2.5,
  },
  {
    p: 167, x: 78, act: 'ask', board: true, names: true, runaway: true, route: true,
    text: 'Three major ethical theories address the case. Each asks the same question: what makes an action good?',
    dur: 4.2,
  },
  {
    p: 158, x: 78, act: 'pull', board: true, names: true, runaway: true, route: true, pulled: true,
    text: 'John Stuart Mill’s utilitarianism says to pull the lever. For Mill, the right act produces the most happiness, counting each person equally.',
    cite: 'Consequentialism — the outcome',
    dur: 2.3,
  },
  {
    p: 158, x: 84, act: 'weigh', board: true, names: true, runaway: true, route: true, pulled: true, weights: true, gloss: 1,
    text: 'Five lives saved outweigh one lost. Judging acts by outcomes is consequentialism, and Mill’s version is utilitarianism.',
    dur: 2.3,
  },
  {
    p: 158, x: 226, act: 'reset', board: true, names: true, runaway: true, route: true, weights: true, gloss: 1,
    text: 'Immanuel Kant’s ethics rejects the trade. It holds that the one person has a worth no arithmetic can outweigh.',
    cite: 'Deontology — the duty',
    dur: 3.8,
  },
  {
    p: 158, x: 226, act: 'read', board: true, names: true, runaway: true, route: true, weights: true, open: true, gloss: 2,
    text: 'This worth is what Kant calls dignity. In deontology, the ethics of duty, a duty binds whatever the consequences.',
    dur: 1.8,
  },
  {
    p: 158, x: 318, act: 'mirror', board: true, names: true, runaway: true, route: true, weights: true, open: true, reflect: true, gloss: 2,
    text: 'Aristotle shifts the question from the act to the agent. Who does this choice make you?',
    cite: 'Virtue ethics — the character',
    dur: 2.9,
  },
  {
    p: 158, x: 318, act: 'wise', board: true, names: true, runaway: true, route: true, weights: true, open: true, reflect: true, gloss: 3,
    text: 'In virtue ethics, the guide is what a practically wise person would do. Aristotle calls this wisdom phronesis.',
    dur: 1.8,
  },
  {
    p: 263, x: 318, board: true, names: true, runaway: true, route: true, weights: true, open: true, reflect: true, gloss: 3,
    quote: {
      id: 'lq-ethics-ethics-3-1',
      text: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
      author: 'Immanuel Kant',
      philosopherId: 'immanuel-kant',
      work: 'Groundwork of the Metaphysics of Morals',
      era: '1785',
      branchSlugs: ['ethics'],
    },
    dur: 3.2,
  },
  {
    p: 260, x: 318, board: true, names: true, runaway: true, route: true, weights: true, open: true, reflect: true, gloss: 3,
    interact: {
      prompt: 'Which of these does a consequentialist not weigh?',
      odd: {
        axis: 'THREE GO ON THE SCALES',
        tiles: [
          { id: 'good', reads: 'HOW MUCH GOOD IT DOES' },
          { id: 'harm', reads: 'HOW MUCH HARM IT DOES' },
          { id: 'who', reads: 'HOW MANY IT REACHES' },
          { id: 'rule', reads: 'WHICH RULE IT FOLLOWED', correct: true },
        ],
      },
      explain: 'The rule it followed. A consequentialist reads everything off the outcome. Keeping a promise and breaking one count only through what each brings about. That\'s the whole quarrel with a theory of duties.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 318, board: true, names: true, runaway: true, route: true, weights: true, open: true, reflect: true, gloss: 3, lamps: true,
    interact: {
      prompt: 'Is it true that utilitarians and Kant both hold that the end justifies the means?',
      explain: 'False. A utilitarian may let a good end justify the means. Kant forbids it: a person must never be treated merely as a means, whatever the consequences.',
      xp: 5,
    },
    dur: 1,
  },
  {
    board: true, names: true, runaway: true, route: true, weights: true, open: true, reflect: true, gloss: 3,
    summary: {
      title: 'Three Lenses on Moral Action',
      points: [
        'Consequentialism: judge by the outcome',
        'Deontology: duty binds whatever the consequences',
        'Virtue ethics: ask what a person of good character would do',
        'Together they are the main theories of normative ethics',
      ],
      closing: 'In a hard case, applying all three shows where outcome, duty and character conflict.',
    },
    dur: 2.8,
  },
];
