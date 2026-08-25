import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-5, "The Big Questions of Society". Plato's just city
// is drawn as the three-tier diagram it actually is — RULERS · GUARDIANS · PRODUCERS,
// each part doing its own work. Rawls's veil then drops over the figure and strikes
// out who they happen to be (CLASS · TALENT · WEALTH · LUCK). A timeline rules the
// whole conversation together, Hobbes to Rawls. The second question is answered IN the
// scene: four definition cards take the stage.

export interface Pol5Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** Plato's three-tier city 0..1. */ city?: number;
  /** The veil of ignorance drawn over the figure 0..1. */ veil?: number;
  /** The timeline that links the thinkers 0..1. */ link?: number;
}

export const BEATS: Pol5Beat[] = [
  {
    p: 2, city: 1, veil: 0,
    text: 'What makes a whole society just? Plato asked it roughly 2,400 years ago — and we are still arguing.',
    dur: 3.4,
  },
  {
    p: 13, city: 1,
    text: 'Plato asks what a perfectly just city would look like. His answer: everyone does the work they are suited to, and nobody meddles. Ruling goes to philosopher-kings, the only people he thinks actually know what good is.',
    cite: 'Plato’s just city',
    dur: 5.2,
  },
  {
    p: 144, city: 1,
    quote: {
      id: 'lq-political-political-5-1',
      text: 'Man is by nature a political animal.',
      author: 'Aristotle',
      work: 'Politics',
      era: 'c. 350 BCE',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.0,
  },
  {
    p: 4, city: 0, veil: 1,
    text: 'Rawls asks it another way. What rules would you pick if you did not know who you were going to be? Hide your class, your talents and your luck behind a veil, and watch how fair your choices get.',
    cite: 'Rawls’ veil of ignorance',
    dur: 5.4,
  },
  {
    p: 4, veil: 1,
    interact: {
      prompt: 'You pick the rules without knowing who you will turn out to be. Tap what that is for.',
      cards: [
        { text: 'Fair rules, hiding who you are', correct: true },
        { text: 'To make everyone equal', correct: false },
      ],
      explain: 'The veil hides your race, your class and your talents, so the rules you pick stay fair. Equal liberties for all, and a gap in wealth only where the gap helps the worst off.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 5, veil: 0.3, city: 0.6, link: 1,
    text: 'Watch the big questions link up. Hobbes asks why we build societies. Locke and Rousseau ask what makes them legitimate. Mill asks how far they may bind you. Plato and Rawls ask what justice demands.',
    cite: 'One long conversation',
    dur: 5.0,
  },
  {
    p: 4, city: 1,
    // Answered ON the stage: the four cards are Plato's candidate definitions, so the
    // reader picks what "justice" meant instead of reading four sentences.
    interact: {
      prompt: 'Plato’s just city sounds fair — so what did he mean by "justice"?',
      explain: 'The trap: "fair" tempts us toward equal wealth. But for Plato justice is harmony — each class doing its own work — not equal shares or majority rule.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Lasting Questions',
      points: [
        'Plato: justice is each part doing its work',
        'Rawls: fair rules are chosen behind the veil',
        'Rawls protects the worst-off',
        'These questions still fuel debate today',
      ],
      closing: 'Political philosophy is not dusty history; it shapes your world now.',
    },
    dur: 2.8,
  },
];
