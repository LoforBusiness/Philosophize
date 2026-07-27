import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-5, "How Humans First Started Thinking Ethically" — the
// SHOWCASE lesson for atmosphere: Socrates and a student walk and talk through a
// snowy ancient Athens, columns behind them, snow drifting down, as they trace the
// Axial Age from Greece to India to China.
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
  /** The walking pair's base x (they stride between beats). */ sx?: number;
  /** Socrates gesture (emote code). */ soc?: number;
  /** Student gesture (emote code). */ stu?: number;
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
    sx: 118, soc: 1, stu: 0, chart: 1,
    text: 'Long ago — in Greece, in India, in China — humans began to argue, out loud, about how to live.',
    dur: 3.2,
  },
  {
    sx: 158, soc: 2, stu: 4, chart: 1,
    text: 'In 1949 Karl Jaspers named it the Axial Age: roughly 800 to 200 BCE, when reflective ethics flared up in three places at once. One shared cause? Historians still argue. The pattern is suggestive, not proven.',
    cite: 'The Axial Age',
    dur: 5.4,
  },
  {
    sx: 158, soc: 13, stu: 4, chart: 2,
    text: 'Socrates wrote nothing; we meet him through Plato. He cross-examined Athenians — "What is virtue? Justice?" In 399 BCE the city tried him, and he drank hemlock. His question, what is the good life, never left.',
    cite: 'Greece — Socrates',
    dur: 5.4,
  },
  {
    sx: 206, soc: 5, stu: 2, chart: 3,
    text: 'Half a world away, the same stirring. In India, ethics turned on dharma — duty and right conduct fit to your role. In China, Confucius grew virtue from ren, humaneness, cultivated in our bonds.',
    cite: 'India — China',
    dur: 5.2,
  },
  {
    sx: 206, soc: 0, stu: 0, chart: 3,
    quote: {
      id: 'lq-ethics-ethics-5-1',
      text: 'Do not impose on others what you yourself do not desire.',
      author: 'Confucius',
      work: 'The Analects, 15.24',
      era: 'c. 5th c. BCE',
      branchSlugs: ['ethics'],
    },
    dur: 3.4,
  },
  {
    sx: 206, soc: 4, stu: 4, fork: 1,
    interact: {
      prompt: 'For Confucius, where does virtue (ren) grow? Take the path.',
      explain: 'For Confucius ren is shaped in real bonds — family, friends, ruler and citizen. Fittingly, his own disciples compiled the Analects after his death.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sx: 206, soc: 4, stu: 0, balance: 1,
    interact: {
      prompt: 'The "Axial Age" — tip the scale. Is it a proven fact, or an interpretive thesis?',
      explain: 'It sounds like a settled date or shared creed, but Jaspers coined it in 1949 as an interpretive thesis about parallel awakenings — one many historians still dispute.',
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
      closing: 'None of these founders wrote for us; their pupils carried the questions forward.',
    },
    dur: 2.8,
  },
];
