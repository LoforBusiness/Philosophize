import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-4, "Where Does Knowledge Come From?" —
// empiricists against rationalists.
// Theme: A DARK CLOSET WITH ONE OPENING: A CAMERA OBSCURA AND A SHEET OF WHITE PAPER.
//
// Locke's own picture of the understanding is a closet shut from the light, with
// one small opening to let in images of what is outside. He opens the shutter and
// the tree and its red apple appear on the white paper, upside down; he feels the
// beam's warmth with his hand; the apple on the paper assembles from its simple
// parts. For the rationalists he closes the shutter and draws a perfect circle
// with a compass; for the Meno he lays four triangles into the doubled square, whose
// outline was there before he began. For Kant he opens the shutter again and lowers
// a grid over the image: SPACE, TIME, CAUSE.
//
// Redrawn 2026-09-26, the third lesson of the branch in reading order. Every line,
// citation, quotation and summary point is copied from the previous script by a
// generator, word for word and beat for beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi4Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 96 at the shutter · 150 in the room · 164 and 270 at either end of the desk · 250 at the cord. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'blank' | 'open' | 'fed' | 'simple' | 'shut' | 'compass' | 'meno' | 'recall' | 'kant' | 'forms';
  /** The shutter over the opening is open and the image is on the paper. */ lit?: boolean;
  /** The plates over the room: 1 EXPERIENCE · 2 and REASON. */ plates?: number;
  /** The apple on the paper has been assembled from its simple parts. */ apple?: boolean;
  /** The compass circle is drawn on the desk. */ circle?: boolean;
  /** The four triangles are laid into the doubled square. */ tiles?: boolean;
  /** The grid of space, time and cause hangs over the image. */ grid?: boolean;
  /** Q1 on the stage: four name cards pinned to the paper. */ names?: boolean;
}

export const BEATS: Epi4Beat[] = [
  {
    p: 158, x: 150, act: 'blank', plates: 2,
    text: 'Does the mind begin empty, or does it contain some knowledge from birth? Empiricists and rationalists give opposing answers.',
    dur: 3.4,
  },
  {
    p: 158, x: 96, act: 'open', plates: 2, lit: true,
    text: 'John Locke compared the newborn mind to white paper. All its ideas, he argued, come from sensation or from reflection on its own workings.',
    cite: 'Empiricism — from experience',
    dur: 4.2,
  },
  {
    p: 263, x: 96, act: 'fed', plates: 2, lit: true,
    text: 'This view is called empiricism. It holds that the materials of all knowledge come from experience.',
    dur: 1.8,
  },
  {
    p: 158, x: 96, act: 'simple', plates: 2, lit: true, apple: true,
    text: 'On Locke’s account, you get the idea of red from seeing red things, and heat from feeling heat. Complex ideas are built by combining such simple ideas.',
    cite: 'Locke, 1689',
    dur: 4.6,
  },
  {
    p: 263, x: 96, plates: 2, lit: true, apple: true,
    quote: {
      id: 'lq-epistemology-knowledge-4-1',
      text: 'Let us suppose the mind to be white paper, void of all characters, without any ideas. How comes it to be furnished?',
      author: 'John Locke',
      philosopherId: 'john-locke',
      work: 'An Essay Concerning Human Understanding',
      era: '1689',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    p: 158, x: 164, act: 'shut', plates: 2, apple: true,
    text: 'Rationalists reply that some knowledge doesn’t depend on experience. Reason alone can establish certain truths.',
    cite: 'Rationalism — from reason',
    dur: 1.8,
  },
  {
    p: 268, x: 164, act: 'compass', plates: 2, apple: true, circle: true,
    text: 'Descartes and Leibniz held that reason alone can grasp the truths of maths and logic. Knowledge that doesn’t rest on experience is called a priori.',
    dur: 3.2,
  },
  {
    p: 268, x: 270, act: 'meno', plates: 2, apple: true, circle: true, tiles: true,
    text: 'In Plato’s Meno, Socrates questions an untaught boy from Meno’s household about how to double a square. Socrates insists he teaches the boy nothing and only asks questions.',
    cite: 'Plato, Meno',
    dur: 3.2,
  },
  {
    p: 263, x: 270, act: 'recall', plates: 2, apple: true, circle: true, tiles: true,
    text: 'Plato argues that learning is recollection: the soul already knew these truths before birth.',
    dur: 1.8,
  },
  {
    p: 260, x: 270, plates: 2, apple: true, circle: true, tiles: true, names: true,
    interact: {
      prompt: 'Which of these thinkers held that the mind starts with no innate ideas?',
      explain: 'John Locke. He called the newborn mind “white paper”, furnished only through sensation and reflection. Descartes, Plato and Leibniz all held that some ideas or knowledge are innate.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 158, x: 96, act: 'kant', plates: 2, apple: true, circle: true, tiles: true, lit: true,
    text: 'Immanuel Kant argued that each side was partly right. The content of knowledge does come through the senses.',
    cite: 'Kant’s compromise',
    dur: 2.4,
  },
  {
    p: 158, x: 250, act: 'forms', plates: 2, apple: true, circle: true, tiles: true, lit: true, grid: true,
    text: 'But the mind orders that content through its own forms, space and time, and concepts such as cause. Knowledge needs both.',
    dur: 2.6,
  },
  {
    p: 260, x: 250, plates: 2, apple: true, circle: true, tiles: true, lit: true, grid: true,
    interact: {
      prompt: 'How much does reason alone give, on the rationalist view?',
      sort: {
        chip: 'KNOWN WITHOUT EXPERIENCE',
        bins: [
          { id: 'none', label: 'NONE OF IT', reads: 'none: every bit of it comes from experience' },
          { id: 'some', label: 'SOME OF IT', reads: 'some of it, and experience supplies the rest', correct: true },
          { id: 'all', label: 'ALL OF IT', reads: 'all of it: experience teaches nothing' },
        ],
      },
      explain: 'Some of it. Rationalism is the claim that certain truths are reachable by reason without experience, not that experience is idle. Reading it as the stronger claim makes it easy to refute and isn\'t what anyone defended.',
      xp: 5,
    },
    dur: 1,
  },
  {
    plates: 2, apple: true, circle: true, tiles: true, lit: true, grid: true,
    summary: {
      title: 'Empiricists Versus Rationalists',
      points: [
        'Empiricists trace ideas to sensation and reflection',
        'Locke held that the mind begins as white paper',
        'Rationalists hold that reason alone yields a priori truths',
        'Kant held that knowledge needs both senses and mind',
      ],
      closing: 'Whether any knowledge is a priori remains a central question in epistemology.',
    },
    dur: 2.8,
  },
];
