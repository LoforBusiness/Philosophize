import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Script for the cinematic version of ethics-ethics-1, "Why Humans Care About
// Right and Wrong". Theme: THE CONSCIENCE THAT STEPS OUT.
//
// A figure acts; then a faint second self — his conscience — steps out of him,
// turns back, and weighs the deed on a balance. Beside him an animal shares the
// raw materials of morality (it nuzzles, it cares) but never steps out of itself
// to ask "was that right?". That reflective step is the whole lesson.
//
// The two graded questions are lifted from data/.../why-humans-care-about-right-
// and-wrong.ts so scoring matches the card runner.
// ─────────────────────────────────────────────────────────────────────────────

export interface EthicsBeat extends BaseBeat {
  /** Human pose: 0 stand · 1 act (reach/take) · 2 present · 3 count · 4 reflect. */
  hpose?: number;
  /** The conscience self has stepped out (and the balance is present). */
  judge?: boolean;
  /** The animal is on stage (left). */
  critter?: boolean;
  /** A sprout — Aristotle's flourishing. */
  plant?: boolean;
  /**
   * The three-source card: where conscience is said to come from. A pure scene cue
   * for the beat that names Darwin, Freud and Kant — their three answers are a
   * three-row table, so the stage draws one instead of repeating the beat before it.
   */
  origins?: boolean;
  /** This beat's answer drives the scene: q1 raises the conscience, q2 parts them. */
  weigh?: 'q1' | 'q2';
}

export const BEATS: EthicsBeat[] = [
  {
    hpose: 1,                                        // act — a deed is done
    text: 'You act. A moment later a question arrives on its own.',
    dur: 2.2,
  },
  {
    hpose: 1,                                        // act — a deed is done
    text: 'Was the act right?',
    dur: 1.8,
  },
  {
    hpose: 2,
    critter: true,
    text: 'You are not alone in caring. Darwin traced morality’s raw materials — empathy, fairness, care for your group — to instincts we share with other animals.',
    dur: 4.2,
  },
  {
    hpose: 4,
    judge: true,
    text: 'What you add is this: you stop and weigh the deed. You ask "was that right?',
    dur: 2.2,
  },
  {
    hpose: 4,
    judge: true,
    text: '— and you answer in reasons, on a balance no animal sets up.',
    dur: 1.8,
  },
  {
    hpose: 4,
    judge: true,
    origins: true,
    text: 'That inward weighing is your conscience. It is the sense that something is wrong even when nobody is watching.',
    cite: 'Darwin · Freud · Kant',
    dur: 2.3,
  },
  {
    hpose: 4,
    judge: true,
    origins: true,
    text: 'Where it comes from is disputed — instinct, says Darwin; society turned inward, says Freud; reason itself, says Kant.',
    dur: 2.3,
  },
  {
    hpose: 2,
    text: 'Aristotle asked a different question. Not "which rules?',
    cite: 'Aristotle, Nicomachean Ethics, c. 350 BCE',
    dur: 1.8,
  },
  {
    hpose: 2,
    text: 'but "what is a good life? What sets us apart is that we can reason.',
    dur: 2.1,
  },
  {
    hpose: 2,
    text: 'So living well means doing that well, over a whole life.',
    dur: 1.8,
  },
  {
    hpose: 0,
    quote: {
      id: 'lq-ethics-ethics-1-1',
      text: 'The unexamined life is not worth living.',
      author: 'Socrates',
      work: 'Plato, Apology',
      era: '38a',
      philosopherId: 'socrates',
      branchSlugs: ['ethics'],
    },
    dur: 2.6,
  },
  {
    hpose: 4,
    judge: true,
    weigh: 'q1',
    interact: {
      prompt: 'What sets a person apart from other social animals?',
      cards: [
        { text: 'We judge and give reasons', correct: true },
        { text: 'Only humans feel empathy', correct: false },
      ],
      explain: 'Apes show the building blocks — empathy, fairness. What humans add is language and reflective self-judgment: stepping back to ask "was that right?"',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    critter: true,
    judge: true,
    weigh: 'q2',
    interact: {
      prompt: 'Drag to how much of a conscience the apes already have.',
      drag: {
        lo: 'NONE OF IT',
        hi: 'THE WHOLE THING',
        start: 1,
        zones: [
          { id: 'none', upto: 0.26, reads: 'none at all' },
          { id: 'parts', upto: 0.72, reads: 'the feelings, and not the stepping back', correct: true },
          { id: 'all', upto: 1, reads: 'the whole thing, judging included' },
        ],
      },
      explain: 'Most of the way, and the last stretch is the difference. Apes have the building blocks — empathy, a keen sense of fairness, distress at cruelty. What is missing is the step out: putting it in words and asking yourself whether that was right.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 2,
    plant: true,
    text: 'Aristotle’s word for the goal is eudaimonia. It usually gets translated as happiness, which is wrong.',
    dur: 2.2,
  },
  {
    hpose: 2,
    plant: true,
    text: 'Flourishing is closer — living and acting well, with a strong character, over a whole life.',
    dur: 2.2,
  },
  {
    summary: {
      title: 'Why Ethics Starts With You',
      points: [
        'We share moral building blocks with animals',
        'Only we step back and judge ourselves',
        'Where conscience comes from is still debated',
        'Aristotle: ethics is flourishing, not rules',
      ],
      closing: 'Asking whether an act was right is where ethics begins.',
    },
    dur: 2.8,
  },
];
