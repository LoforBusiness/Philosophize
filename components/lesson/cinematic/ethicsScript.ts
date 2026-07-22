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
  /** This beat's answer drives the scene: q1 raises the conscience, q2 parts them. */
  weigh?: 'q1' | 'q2';
}

export const BEATS: EthicsBeat[] = [
  {
    hpose: 1,                                        // act — a deed is done
    text: 'You did something. A moment later, a question arrives on its own: was it right?',
    dur: 3.0,
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
    text: 'What you add is this: you step back, out of yourself, and judge the deed. You ask "was that right?" — and you answer in reasons.',
    dur: 4.0,
  },
  {
    hpose: 4,
    judge: true,
    text: 'That second self is your conscience — the sense something is wrong even when no one is watching. Darwin traced it to instinct, Freud to society turned inward, Kant to reason itself.',
    cite: 'Darwin · Freud · Kant',
    dur: 4.6,
  },
  {
    hpose: 2,
    text: 'Around 350 BCE, Aristotle asked a different question: not "which rules?" but "what is a good life?" Our defining power is reason — so living well means using it, with virtue, across a whole life.',
    cite: 'Aristotle, Nicomachean Ethics, c. 350 BCE',
    dur: 4.8,
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
    mc: {
      prompt: 'What most clearly sets human moral life apart from other social animals?',
      options: [
        { id: 'a', text: 'We step back, judge our actions, and give reasons in words', correct: true },
        { id: 'b', text: 'We run on raw instinct alone, never on thought', correct: false },
        { id: 'c', text: 'Only humans show any trace of empathy or fairness', correct: false },
        { id: 'd', text: 'We always grab whatever serves us best', correct: false },
      ],
      explain:
        'Apes show the building blocks — empathy, fairness. What humans add is language and reflective self-judgment: stepping back to ask "was that right?"',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    critter: true,
    judge: true,
    weigh: 'q2',
    mc: {
      prompt: 'Apes show empathy and fairness — so they must have a conscience just like ours. True or false?',
      options: [
        { id: 't', text: 'True', correct: false },
        { id: 'f', text: 'False', correct: true },
      ],
      explain:
        'They share the building blocks, but conscience adds the reflective step — judging yourself, in words. The animal cares; only you step out and ask "was that right?"',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 2,
    plant: true,
    text: 'Aristotle named the goal eudaimonia — best rendered "flourishing," not "feeling happy." It is living and acting well, with strong character, over a lifetime.',
    dur: 4.4,
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
      closing: 'Asking "was that right?" is where ethics begins.',
    },
    dur: 2.8,
  },
];
