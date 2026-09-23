import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-38, "The Argument That Proves Too Much"
// Theme: ONE MACHINE, RUN TWICE, AND THE SECOND OUTPUT IS ABSURD.
//
// The argument is drawn as a MILL: three steps stacked in a frame, a hopper at
// the top where a word goes in, and a tray at the bottom where a verdict comes
// out. Anselm's word goes in first and EXISTS drops into the tray. Nothing about
// that looks wrong.
//
// Then the SAME mill is drawn again beside it — same three steps, not one glyph
// changed — with ISLAND in the hopper. EXISTS drops into that tray too, and it is
// obviously false. The picture carries the whole argument: the reader can see
// that nothing was altered, which is the only thing Gaunilo needed to say.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — three verdict plates, and the reader picks what the
//     second run has shown. A tap on the stage rather than a card because the
//     answer is about the PICTURE: two identical mills, one absurd tray.
//   · beat 7  a SPLIT — where the fault lies, between the form and what was fed
//     in. A seam rather than a pick, because the honest answer is a proportion:
//     Anselm's own reply is that one step does not carry over.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic38Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the first mill is drawn. */ mill?: number;
  /** How far the first run has turned, 0…1 — hopper to tray. */ runA?: number;
  /** 1 = the second mill stands beside it. */ twin?: number;
  /** How far the second run has turned, 0…1. */ runB?: number;
  /** 1 = the three verdict plates are up. */ verdicts?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic38Beat[] = [
  {
    p: 172, x: 60, mill: 1,
    text: 'An argument has a form that can be separated from its subject matter. The form shown has three steps, and a subject is supplied at the top.',
    dur: 3.8,
  },
  {
    p: 30, x: 60, mill: 1, runA: 1,
    text: 'Anselm of Canterbury defines God as that than which nothing greater can be conceived. He holds that to exist in reality is greater than to exist only in the mind.',
    dur: 4.4,
  },
  {
    p: 176, x: 60, mill: 1, runA: 1, twin: 1, runB: 1,
    text: 'Gaunilo, a monk of Marmoutiers, kept the same three steps and changed only the subject. He applied them to the greatest conceivable island.',
    dur: 4.4,
  },
  {
    p: 160, x: 60, mill: 1, runA: 1, twin: 1, runB: 1, verdicts: 1, live: 1,
    interact: {
      prompt: 'What does the island argument show about Anselm’s argument?',
      explain: 'The form is faulty. Both arguments use the same three steps, so if one succeeds, so does the other. No such island exists. Rejecting the comparison is no reply unless someone names a step that fails for the island.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 60, mill: 1, runA: 1, twin: 1, runB: 1, verdicts: 1,
    text: 'The two arguments share every step and differ only in their subject. So they must both succeed or both fail.',
    dur: 3.2,
  },
  {
    p: 6, x: 100, mill: 1, runA: 1, twin: 1, runB: 1, verdicts: 1,
    text: 'Any flaw in the island argument’s steps is also in Anselm’s. An argument whose form yields absurd conclusions is said to prove too much.',
    dur: 3.8,
  },
  {
    p: 433, x: 100, mill: 1, runA: 1, twin: 1, runB: 1,
    quote: {
      id: 'lq-logic-arguments-38-1',
      text: 'I know not which I ought to regard as the greater fool: myself, or the man who thinks he has proved it.',
      author: 'Gaunilo of Marmoutiers',
      work: 'On Behalf of the Fool',
      era: 'c. 1078',
      branchSlugs: ['logic'],
    },
    dur: 4.2,
  },
  {
    p: 177, x: 100, mill: 1, runA: 1, twin: 1, runB: 1,
    interact: {
      prompt: 'Where does the fault in the objection lie?',
      sort: {
        chip: 'THE FAULT',
        bins: [
          { id: 'concept', label: 'IN THE CONCEPT', reads: 'in the concept, with no faulty step named' },
          { id: 'even', label: 'HALF EACH', reads: 'split evenly, leaving the objection standing' },
          { id: 'shape', label: 'IN THE FORM', reads: 'in the form, apart from one step it excludes', correct: true },
        ],
      },
      explain: 'In the form. An objection that names no faulty step is a complaint about the conclusion rather than about the reasoning, and it can\'t be answered or pressed. Pointing to the step that doesn\'t follow is what makes it an objection at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Arguments That Prove Too Much',
      points: [
        'An argument’s form can be applied to any subject',
        'Apply the form to a parallel case and check the conclusion',
        'An absurd conclusion shows the form is faulty',
        'A defender must name a step that fails in the parallel case',
      ],
      closing: 'Before defending a conclusion, apply the same reasoning to a case whose conclusion you already reject.',
    },
    dur: 3.2,
  },
];
