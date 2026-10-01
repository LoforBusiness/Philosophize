import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic science-foundations-3, "Correlation Isn’t Causation" — the third lesson on
// the Science road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A SEASIDE PROMENADE, AN ICE CREAM KIOSK, AND A CHART ON AN EASEL.
//
// Three people talk, and nobody narrates. A beach-goer (the woman with the bun) reads a
// chart and decides that ice cream causes sunburn; her friend (the plain mascot) has a
// cornet in his hand and views on the matter; the scientist (the top hat) shows what
// two lines rising together can and cannot tell you.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: two things can rise together
// without one causing the other · look for a hidden cause behind both · to show a cause,
// change only that thing and see what follows.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Sci3Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * chart — the beach-goer points at the two lines rising on the chart on the easel ·
   * cornet — her friend holds up his ice cream cornet and looks at it doubtfully ·
   * arrive — the scientist walks in along the promenade, tips his hat and traces both lines on the chart ·
   * hidden — he sweeps a hand up both lines, then points up as the cloud drifts off the sun ·
   * sunny — the beach-goer shades her eyes and looks up at the sun ·
   * change — the scientist fetches the furled umbrella off the railing, plants it in the sand and opens it ·
   * shade — her friend sits down under the umbrella with his cornet ·
   * test — the scientist points from the umbrella’s shade to the sunny sand ·
   * cream — the beach-goer rubs sun cream on her arms and buys a cornet ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'chart' | 'cornet' | 'arrive' | 'hidden' | 'sunny' | 'change' | 'shade' | 'test' | 'cream' | 'rest';
  /** The scientist is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The beach umbrella: 0 furled, leaning on the promenade railing · 1 open, planted in the sand. */
  shade?: number;
  /** The sun: 0 behind a cloud · 1 out and blazing (the cloud drifts off it as the scientist names it, b3). */
  sun?: number;
  /** First question on the stage: the sun, the ice cream kiosk and the chart are the things to tap. */
  cause?: boolean;
  /** Second question on the stage: the umbrella’s shade, the kiosk’s queue and the open sand are the things to tap. */
  trial?: boolean;
}

export const BEATS: Sci3Beat[] = [
  {
    act: 'chart', shade: 0, sun: 0,
    speaker: 'bun',
    text: 'Look at the chart! When ice cream sales go up, so does sunburn, so ice cream must burn you!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'cornet', shade: 0, sun: 0,
    speaker: 'plain',
    text: 'Yes, I’ve always found my cornet terribly hot.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, shade: 0, sun: 0,
    speaker: 'tophat',
    text: 'The two lines do rise together. That’s called a correlation, and it doesn’t mean one causes the other.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'hidden', th: true, shade: 0, sun: 1,
    speaker: 'tophat',
    text: 'Often a hidden cause pushes both of them up. Here, it’s the thing everybody came to the seaside for.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, shade: 0, sun: 1, cause: true,
    interact: {
      prompt: 'What makes ice cream sales and sunburn rise together?',
      explain: 'The sun. Sunny days bring more people out to buy ice cream, and more people into the sun to get burnt. The kiosk sells the ice cream, and the chart only shows the two lines.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'sunny', th: true, shade: 0, sun: 1,
    speaker: 'bun',
    text: 'Oh, sunny days! More people out buying ice cream, and more people out in the sun.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'change', th: true, shade: 1, sun: 1,
    speaker: 'tophat',
    text: 'To show that one thing causes another, change only that thing. Then watch whether the other one follows.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'shade', th: true, shade: 1, sun: 1,
    speaker: 'plain',
    text: 'So a whole afternoon of ice cream in the shade. I’ll volunteer.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'test', th: true, shade: 1, sun: 1,
    speaker: 'tophat',
    text: 'Eat ice cream in the shade, and the sunburn won’t come. Sit out in the sun without any, and it will.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, shade: 1, sun: 1, trial: true,
    interact: {
      prompt: 'Where could he eat his ice cream to test what really causes sunburn?',
      explain: 'The umbrella’s shade. Ice cream with no sun shows whether ice cream burns on its own. The queue and the open sand are both out in the sun, so they can’t tell the two apart.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'cream', th: true, shade: 1, sun: 1,
    speaker: 'bun',
    text: 'Sun cream, then, and an ice cream anyway. Science is delicious!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, shade: 1, sun: 1,
    quote: {
      id: 'lq-science-foundations-3-1',
      text: 'The first principle is that you must not fool yourself, and you are the easiest person to fool.',
      author: 'Richard Feynman',
      work: 'Cargo Cult Science, a Caltech commencement address',
      era: '1974',
      branchSlugs: ['science'],
    },
    dur: 3.0,
  },
  {
    th: true, shade: 1, sun: 1,
    summary: {
      title: 'Correlation Isn’t Causation',
      points: [
        'Two things can rise together without one causing the other',
        'Look for a hidden cause behind them both',
        'To show a cause, change only that one thing',
      ],
      closing: 'Next time two things move together, ask what else might be moving them.',
    },
    dur: 2.8,
  },
];
