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
    p: 443, city: 1, veil: 0,
    text: 'What makes a whole society just? Plato asked this in the Republic twenty-four centuries ago, and the answer is still disputed.',
    dur: 3.4,
  },
  {
    p: 13, city: 1,
    text: 'Plato describes a just city as one in which each class does its own work. No class meddles in the work of another.',
    cite: 'Plato’s just city',
    dur: 3.2,
  },
  {
    p: 13, city: 1,
    text: 'Philosopher-kings rule, because Plato holds that only they know the good. Guardians defend the city, and producers supply it.',
    dur: 2,
  },
  {
    p: 144, city: 1,
    quote: {
      id: 'lq-political-political-5-1',
      text: 'Man is by nature a political animal.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Politics',
      era: 'c. 350 BCE',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.0,
  },
  {
    p: 467, city: 0, veil: 1,
    text: 'John Rawls approaches the question differently. He asks which principles you’d choose if you didn’t know your place in society.',
    cite: 'Rawls’ veil of ignorance',
    dur: 2.9,
  },
  {
    p: 399, city: 0, veil: 1,
    text: 'Behind this veil of ignorance, you don’t know your class, talents, wealth or luck. So you can’t choose rules that favour yourself.',
    dur: 2.5,
  },
  {
    p: 165, veil: 1,
    interact: {
      prompt: 'What is the veil of ignorance meant to secure?',
      sort: {
        chip: 'the veil of ignorance',
        bins: [
          { id: 'equal', label: 'equal outcomes', reads: 'equal shares of wealth for everyone' },
          { id: 'rich', label: 'a richer society', reads: 'the greatest total wealth for society' },
          { id: 'fair', label: 'fair rules', reads: 'principles chosen without knowing who benefits', correct: true },
        ],
      },
      explain: 'Fair rules. The veil of ignorance hides your class, talents and wealth, so no one can choose principles that favour themselves. The aim isn’t equal outcomes, since Rawls allows inequalities that benefit the worst off.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 5, veil: 0.3, city: 0.6, link: 1,
    text: 'The central questions of political philosophy are connected. Thomas Hobbes asks why anyone should obey a government at all.',
    cite: 'A continuing debate',
    dur: 1.8,
  },
  {
    p: 5, veil: 0.3, city: 0.6, link: 1,
    text: 'Locke and Jean-Jacques Rousseau ask what makes a government legitimate. John Stuart Mill asks how far its power over the individual may extend.',
    dur: 2.3,
  },
  {
    p: 5, veil: 0.3, city: 0.6, link: 1,
    text: 'Plato and Rawls ask what justice itself requires of a whole society.',
    dur: 1.8,
  },
  {
    p: 160, city: 1,
    // Answered ON the stage: the four cards are Plato's candidate definitions, so the
    // reader picks what "justice" meant instead of reading four sentences.
    interact: {
      prompt: 'Which view of justice does Plato’s division of the city into three classes express?',
      explain: 'Each its own work, or harmony between the parts. For Plato, a city is just when rulers, guardians and producers each perform their own function. Equal wealth can sound fairer, but Plato’s justice is an order among parts, not equal shares or majority rule.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Central Questions of Political Philosophy',
      points: [
        'Plato: justice is each part doing its work',
        'Rawls: fair rules are chosen behind a veil of ignorance',
        'Rawls allows inequality only where it helps the worst off',
        'Hobbes, Locke and Mill ask about obedience, legitimacy and limits',
      ],
      closing: 'Each question remains open, and the answers still shape debates about law, rights and government.',
    },
    dur: 2.8,
  },
];
