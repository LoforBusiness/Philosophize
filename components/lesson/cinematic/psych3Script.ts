import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic psychology-foundations-3, "Why We See What We Expect" — the third lesson
// on the Psychology road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A MUSEUM GALLERY, A CHIPPED MUG ON A PLINTH, AND A GRAND LABEL.
//
// Three people talk, and nobody narrates. A visitor (the newsboy cap), kind and easily
// impressed, admires a "royal cup" on a plinth; the gallery attendant (the plain
// mascot) knows it is his own tea mug, put down ten minutes ago under a label meant
// for something else; the psychologist (the top hat) shows how expectation shapes what
// we see.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: the brain decides what the eyes
// take in, and expectation steers it · a label or a hint sets that expectation before
// you look · to see what is there, look again without the hint and check the thing
// itself.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Psych3Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * admire — the visitor leans in to the showcase, hands clasped at his waist, and peers ·
   * mine — the attendant gets up from his stool, points at the mug and goes round
   *   behind the plinth ·
   * arrive — the psychologist walks in, stops by the plinth and taps his temple ·
   * label — he points at the grand label on the plinth ·
   * plain — he takes a card from his coat and lays it over the label, hiding it; the
   *   visitor straightens up, points at the mug and tilts his head ·
   * again — the psychologist points at the covered label, then opens a hand to the
   *   visitor, who leans in to look again ·
   * sticker — the attendant lifts the mug out of the case and turns it to show the
   *   sticker underneath, held out to the visitor (and holds it there through Q2) ·
   * check — the psychologist points at the sticker, then at the covered label ·
   * leave — the visitor gives the mug one last admiring look and strolls off; the
   *   attendant sets the mug back in the case ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'admire' | 'mine' | 'arrive' | 'label' | 'plain' | 'again' | 'sticker' | 'check' | 'leave' | 'rest';
  /** The psychologist is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The label: 0 showing · 1 covered by the psychologist’s card. */
  cover?: number;
  /** The mug: 0 on the plinth · 1 lifted and turned, sticker showing · 2 back on the plinth. */
  mug?: number;
  /** First question on the stage: the label, the mug and the window are the things to tap. */
  told?: boolean;
  /** Second question on the stage: the sticker, the label and the glass case are the things to tap. */
  look?: boolean;
}

export const BEATS: Psych3Beat[] = [
  {
    act: 'admire', cover: 0, mug: 0,
    speaker: 'cap',
    text: 'Would you look at that. A royal cup, fourteen hundred years old, and every chip so delicate.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'mine', cover: 0, mug: 0,
    speaker: 'plain',
    text: 'Remarkable. That’s my tea mug, left on the plinth ten minutes ago.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, cover: 0, mug: 0,
    speaker: 'tophat',
    text: 'Your eyes take in the shapes, but your brain decides what the shapes mean. What you expect changes what you see.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'label', th: true, cover: 0, mug: 0,
    speaker: 'tophat',
    text: 'A label, a price or a hint sets that expectation before you even look. This label said royal.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, cover: 0, mug: 0, told: true,
    interact: {
      prompt: 'What made the visitor see a royal treasure in a tea mug?',
      explain: 'The label. It told him what to expect before he looked, and his brain filled in the rest. The mug itself is ordinary, and the window only lets the light in.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'plain', th: true, cover: 1, mug: 0,
    speaker: 'cap',
    text: 'Well, now it just looks like a mug with a chip in it. Funny, that.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'again', th: true, cover: 1, mug: 0,
    speaker: 'tophat',
    text: 'To see what’s there, look again without the hint. Ask what you’d see if nobody had told you anything.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'sticker', th: true, cover: 1, mug: 1,
    speaker: 'plain',
    text: 'Or read the sticker underneath. It says dishwasher safe.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'check', th: true, cover: 1, mug: 1,
    speaker: 'tophat',
    text: 'That’s the check. Trust the evidence from the thing itself, not what you were told about it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, cover: 1, mug: 1, look: true,
    interact: {
      prompt: 'How could the visitor find out what the cup really is?',
      explain: 'The sticker underneath. It’s evidence from the cup itself. The label is the hint that fooled him, and the glass case only makes things look precious.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'leave', th: true, cover: 1, mug: 2,
    speaker: 'cap',
    text: 'A dishwasher-safe treasure, then. I’ll still give it a nice look on my way out.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, cover: 1, mug: 2,
    quote: {
      id: 'lq-psychology-foundations-3-1',
      text: 'Whilst part of what we perceive comes through our senses from the object before us, another part (and it may be the larger part) always comes out of our own head.',
      author: 'William James',
      work: 'The Principles of Psychology',
      era: '1890',
      branchSlugs: ['psychology'],
    },
    dur: 3.0,
  },
  {
    th: true, cover: 1, mug: 2,
    summary: {
      title: 'Why We See What We Expect',
      points: [
        'Your brain decides what your eyes take in',
        'A label or a hint sets the expectation first',
        'Look again without the hint, and check the thing itself',
      ],
      closing: 'Next time something looks impressive, ask what you were told before you looked.',
    },
    dur: 2.8,
  },
];
