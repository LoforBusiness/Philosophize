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
    text: 'Suppose you adopt a criterion, a test for what counts as knowledge. How could you check that the criterion itself is correct?',
    dur: 4.4,
  },
  {
    p: 30, x: 44, rungs: 0.34,
    text: 'Checking the criterion requires a second criterion, used as a ruler for the first. That second ruler needs checking too.',
    dur: 3.8,
  },
  {
    p: 36, x: 44, rungs: 1,
    text: 'Each check calls for a further check, so the series has no last member. The result is an infinite regress.',
    dur: 4.0,
  },
  {
    p: 160, x: 44, rungs: 1, nothing: 1,
    text: 'Sextus Empiricus argued that no criterion can be established. The checks either run on for ever or return in a circle.',
    dur: 3.8,
  },
  {
    p: 161, x: 44, rungs: 1, nothing: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Where does a particularist begin?',
      explain: 'With the cases. A particularist starts from plain cases of knowledge and builds a criterion to fit them. Moore’s knowledge that he has hands is such a case. Starting from a criterion is methodism, and refusing to start is scepticism.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 44, rungs: 1, nothing: 1, flow: 1,
    text: 'A methodist starts with a criterion and uses it to sort beliefs. Roderick Chisholm’s example is John Locke’s empiricism.',
    dur: 4.2,
  },
  {
    p: 62, x: 100, rungs: 1, nothing: 1, flow: 2,
    text: 'A particularist reverses the order. Particular cases of knowledge come first, and a criterion is built to fit them.',
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
    text: 'Neither starting point can be proved without assuming it. Chisholm conceded that every answer to the problem begs the question.',
    dur: 3.6,
  },
  {
    p: 21, x: 100, rungs: 1, nothing: 1,
    interact: {
      prompt: 'Where should an answer to the problem of the criterion begin?',
      poll: {
        options: [
          { id: 'rule', reads: 'with a criterion, and let it sort the cases', holders: ['John Locke', 'David Hume'] },
          { id: 'cases', reads: 'with the cases, and build a criterion to fit', holders: ['G.E. Moore', 'Roderick Chisholm'], correct: true },
          { id: 'stop', reads: 'nowhere, and suspend judgement', holders: ['Sextus Empiricus'] },
        ],
      },
      explain: 'With the cases, and build a criterion to fit. Particularism starts from knowledge that’s hard to doubt, such as knowing that this is a hand. Starting with a criterion assumes, without proof, that the criterion is correct.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Problem of the Criterion',
      points: [
        'Sorting knowledge from belief seems to need a criterion first',
        'A criterion needs a proof, and a proof needs a criterion',
        'Methodists trust a criterion first, particularists trust cases',
        'Neither starting point can be proved in advance',
      ],
      closing: 'There may be no neutral starting point. Every answer to the problem of the criterion begins with an assumption.',
    },
    dur: 3.8,
  },
];
