import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-5, "How Humans First Started Thinking Ethically" — the
// SHOWCASE lesson for atmosphere: a traveller walks through a snowy ancient Athens,
// columns behind them, snow drifting down, as they trace the Axial Age from Greece
// to India to China.
//
// Above them hangs the lesson's spine as an information graphic: a THREE-LANE
// TIMELINE — Greece / India / China — bracketed by the axial window, 800 to 200 BCE,
// onto which each thinker's name drops as its beat names it. Three ink pills landing
// in the same slice of the axis IS the claim "in three places at once".
//
// New scene-driven answers (no A/B/C/D):
//   Q1  CHOOSE-A-PATH — pick the path (in solitude / among others); they walk it.
//   Q2  TIP-A-BALANCE — tip the scale toward proven-fact or interpretive-thesis.
// Both are the graded questions from data/.../beginning-of-ethical-thinking.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics5Beat extends BaseBeat {
  /**
   * The walker's gesture (emote code).
   *
   * There was a second figure here — see the note at the top of ethics5Scene.tsx.
   * It was never named or used by the narration, and it walked identically to this
   * one. Do not add a companion back without giving it something to do AND a
   * `seed` on its `strideStance`, or the two will march in lockstep again.
   */ soc?: number;
  /** The fork of two paths, tappable (0/1) — Q1. */ fork?: number;
  /** The balance scale, tappable (0/1) — Q2. */ balance?: number;
  /**
   * The Axial-Age timeline overhead: 0 off · 1 axis + empty lanes · 2 + Socrates ·
   * 3 + Dharma and Confucius. It builds up as the narration names each one.
   */ chart?: number;
}

export const BEATS: Ethics5Beat[] = [
  {
    // The empty three-lane chart opens the lesson: it names the very three places
    // this line names, and the thinkers drop into it as the narration reaches them.
    x: 177, soc: 1, chart: 1,
    text: 'In Greece, India and China, thinkers began to argue systematically about how people should live.',
    dur: 3.2,
  },
  {
    x: 217, soc: 2, chart: 1,
    // The chart overhead already draws the window and its dates. Saying them again
    // in the narration is the reader reading a number they can see (J6).
    text: 'Karl Jaspers named this period the Axial Age. He argued that these regions, without contact, began asking similar questions.',
    cite: 'The Axial Age',
    dur: 4.4,
  },
  {
    x: 217, soc: 266, chart: 1,
    // The chart overhead already draws the window and its dates. Saying them again
    // in the narration is the reader reading a number they can see (J6).
    text: 'Scholars dispute why this happened, and some doubt that there was a single Axial Age at all.',
    dur: 1.8,
  },
  {
    x: 217, soc: 266, chart: 2,
    text: 'Socrates wrote nothing. His views are known mainly through the dialogues of his student Plato.',
    cite: 'Greece — Socrates',
    dur: 1.9,
  },
  {
    x: 217, soc: 266, chart: 2,
    text: 'Socrates questioned Athenians about what virtue is. In 399 BCE, Athens executed him for impiety and corrupting the young.',
    dur: 3.5,
  },
  {
    x: 265, soc: 5, chart: 3,
    text: 'In India, a central concept was dharma. It includes the duties that belong to your place in life.',
    cite: 'India — China',
    dur: 2.8,
  },
  {
    x: 265, soc: 259, chart: 3,
    text: 'In China, Confucius taught ren, usually translated as humaneness. He held that ren is cultivated in relationships with others.',
    dur: 2.4,
  },
  {
    x: 265, soc: 147, chart: 3,
    quote: {
      id: 'lq-ethics-ethics-5-1',
      text: 'Do not impose on others what you yourself do not desire.',
      author: 'Confucius',
      philosopherId: 'confucius',
      work: 'The Analects, 15.24',
      era: 'c. 5th c. BCE',
      branchSlugs: ['ethics'],
    },
    dur: 3.4,
  },
  {
    x: 265, soc: 4, fork: 1,
    interact: {
      prompt: 'Where does Confucius hold that ren is cultivated?',
      explain: 'Among others. For Confucius, ren is cultivated in relationships, such as those between ruler and subject or father and son. It can’t be developed in solitude, since it consists in how you treat others.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    x: 265, soc: 4, balance: 1,
    interact: {
      prompt: 'Is the Axial Age a proven historical fact, or an interpretive thesis?',
      explain: 'A thesis. The Axial Age sounds like a dated fact, but the idea is a reading of history. Jaspers saw similar changes in several places and argued that the timing mattered. Historians have disputed the reading ever since.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Ethics Has Ancient, Global Roots',
      points: [
        'The Axial Age is debated, not proven',
        'Socrates pursued virtue and the examined life',
        'Dharma tied right action to duty and role',
        'Confucius rooted ethics in humane relationships',
      ],
      closing: 'The teachings of Socrates and Confucius survive through their students, who recorded the questions they raised.',
    },
    dur: 2.8,
  },
];
