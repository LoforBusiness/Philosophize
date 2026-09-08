import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-25, "How Do You Check Your Own Ruler?"
// Theme: A RULER CHECKED BY A RULER CHECKED BY A RULER, AND NO BOTTOM ONE.
//
// The problem of the criterion is a REGRESS, so the scene draws one: each ruler
// is measured by the one below it, and the lowest hangs over a dashed box with
// nothing in it. The drawing is the argument — every rung is fine on its own, and
// the trouble is that there is no last rung.
//
// The two ways out are then two directions on the same picture rather than two
// slogans: start at the top and sort downward, or start at the bottom with cases
// you already trust and build the rule upward to fit them.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps where the
//     particularist begins. On the stage because the regress they are escaping is
//     already drawn above it.
//   · beat 9  a POLL — where you would begin, and then who else began there. The
//     positions are Sextus, Chisholm's two, so the reader's answer lands them
//     somewhere in a real argument rather than marking a box right or wrong.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology25Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many rungs of the regress have been drawn, 0…1. */ rungs?: number;
  /** 1 = the empty dashed box under the lowest ruler is shown. */ nothing?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** Which way the arrow of enquiry runs: 0 none, 1 downward, 2 upward. */ flow?: number;
}

export const BEATS: Epistemology25Beat[] = [
  {
    p: 2, x: 44,
    text: 'You have a test for what counts as knowledge. Good. How did you check the test?',
    dur: 4.4,
  },
  {
    p: 30, x: 44, rungs: 0.34,
    text: 'Say the ruler is proof. Then the proof needs a ruler of its own.',
    dur: 3.8,
  },
  {
    p: 36, x: 44, rungs: 1,
    text: 'And that one needs another. The line goes down as far as you care to look.',
    dur: 4.0,
  },
  {
    p: 160, x: 44, rungs: 1, nothing: 1,
    text: 'Sextus Empiricus reached the bottom and found nothing standing there.',
    dur: 3.8,
  },
  {
    p: 161, x: 44, rungs: 1, nothing: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap where a particularist begins.',
      explain: 'With the clear cases. A particularist trusts that they know a few plain things, then builds a rule that fits them. Starting from the rule instead is the other way out, and refusing to start is the sceptic\'s.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 44, rungs: 1, nothing: 1, flow: 1,
    text: 'The methodist picks the rule first, then lets it sort every belief below.',
    dur: 4.2,
  },
  {
    p: 62, x: 100, rungs: 1, nothing: 1, flow: 2,
    text: 'The particularist runs it the other way: hands first, then a rule built to fit them.',
    dur: 4.6,
  },
  {
    p: 433, x: 100, rungs: 1, nothing: 1,
    quote: {
      id: 'lq-epistemology-knowledge-25-1',
      text: 'In order to decide whether things really are as they seem, we must possess a criterion.',
      author: 'Sextus Empiricus',
      philosopherId: 'sextus-empiricus',
      work: 'Outlines of Pyrrhonism',
      era: 'c. 200 CE',
      branchSlugs: ['epistemology'],
    },
    dur: 4.2,
  },
  {
    p: 383, x: 100, rungs: 1, nothing: 1,
    text: 'Neither door is proved. Each one simply begins, and admits it.',
    dur: 3.6,
  },
  {
    p: 21, x: 100, rungs: 1, nothing: 1,
    interact: {
      prompt: 'Where would you begin?',
      poll: {
        options: [
          { id: 'rule', reads: 'with the rule, and let it sort the cases' },
          { id: 'cases', reads: 'with the cases, and build the rule to fit', correct: true },
          { id: 'stop', reads: 'refuse to begin, and suspend judgement' },
        ],
      },
      explain: 'With the cases. That is where nearly everyone starts. The rule-first door sounds stricter, but it quietly takes its own rule for granted. Refusing to start is honest, and it also ends every question.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'No Bottom Rung',
      points: [
        'What counts as knowing and what is known chase each other',
        'A criterion needs a proof, and a proof needs a criterion',
        'Methodists trust a rule first, particularists trust cases',
        'Neither door is proved before you walk through it',
      ],
      closing: 'There may be no neutral ground floor here. To ask anything at all, you have to begin somewhere.',
    },
    dur: 3.8,
  },
];
