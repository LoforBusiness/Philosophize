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
    text: 'Long ago — in Greece, in India, in China — humans began to argue, out loud, about how to live.',
    dur: 3.2,
  },
  {
    x: 217, soc: 2, chart: 1,
    // The chart overhead already draws the window and its dates. Saying them again
    // in the narration is the reader reading a number they can see (J6).
    text: 'Karl Jaspers gave that window a name: the Axial Age. Three places, no contact between them, all starting to ask the same kind of question. Nobody has ever agreed on why.',
    cite: 'The Axial Age',
    dur: 5.4,
  },
  {
    x: 217, soc: 13, chart: 2,
    text: 'Socrates never wrote a word down. Everything we have, a student wrote later. He walked up to people in Athens and asked them what virtue was. The city put him on trial and killed him for it.',
    cite: 'Greece — Socrates',
    dur: 5.4,
  },
  {
    x: 265, soc: 5, chart: 3,
    text: 'The same thing is stirring elsewhere. India’s word is dharma: doing what your place in life actually asks of you. China’s is ren, which means something like humaneness, and Confucius says it only ever grows between people.',
    cite: 'India — China',
    dur: 5.2,
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
      prompt: 'Ren has to grow somewhere. Take the path Confucius would send you down.',
      explain: 'Ren is shaped in real relationships — family, friends, ruler and citizen. Confucius has no interest in a virtue you could practise alone in a room.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    x: 265, soc: 4, balance: 1,
    interact: {
      prompt: 'The "Axial Age" — tip the scale. Is it a proven fact, or an interpretive thesis?',
      explain: 'The claim sounds like a fact with a date on it, and is really a reading of history. Jaspers noticed three places changing at once and argued that the timing meant something. Historians have argued back ever since.',
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
      closing: 'Not one of these thinkers wrote a word for us. Their pupils carried the questions forward anyway.',
    },
    dur: 2.8,
  },
];
