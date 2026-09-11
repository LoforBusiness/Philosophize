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
    text: 'An argument is a shape. Three steps, stacked, and a word goes in at the top.',
    dur: 3.8,
  },
  {
    p: 30, x: 60, mill: 1, runA: 1,
    text: 'Anselm feeds in the word God, “that than which nothing greater can be conceived”. For him, existing is greater than not existing.',
    dur: 4.4,
  },
  {
    p: 176, x: 60, mill: 1, runA: 1, twin: 1, runB: 1,
    text: 'A monk named Gaunilo built the same mill and changed one word. He fed in the island than which no greater island can be conceived.',
    dur: 4.4,
  },
  {
    p: 160, x: 60, mill: 1, runA: 1, twin: 1, runB: 1, verdicts: 1, live: 1,
    interact: {
      prompt: 'Tap what the second run has shown.',
      explain: 'The form is faulty. Nothing about the island is special, and being unremarkable is why Gaunilo chose one. Both mills hold the same three steps, so if one is sound the other is. Refusing the comparison is no reply until you name the step that fails.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 60, mill: 1, runA: 1, twin: 1, runB: 1, verdicts: 1,
    text: 'Look at the two frames again. Not one glyph differs between them.',
    dur: 3.2,
  },
  {
    p: 6, x: 100, mill: 1, runA: 1, twin: 1, runB: 1, verdicts: 1,
    text: 'So whatever is wrong is wrong in both, and it was there before anybody mentioned an island.',
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
      prompt: 'Where does the fault sit?',
      split: {
        left: 'IN THE SHAPE', right: 'IN THE WORD',
        start: 0.06,
        zones: [
          { id: 'word', upto: 0.3, reads: 'in the word, and the two words were never compared' },
          { id: 'both', upto: 0.62, reads: 'half and half, which leaves the charge unanswered' },
          { id: 'shape', upto: 1, reads: 'nearly all in the shape, unless a step refuses the island', correct: true },
        ],
      },
      explain: 'Nearly all in the shape. The two runs differ only in what went into the hopper, so the burden falls on the steps. Anselm answered there, arguing that a greatest island is incoherent. Whether the reply works is still argued. Where to argue is not in doubt.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Running It Again',
      points: [
        'A form works on anything you pour into it',
        'Pour in a parallel case and read the tray',
        'An absurd output convicts the form, not the topic',
        'The only reply names a step that will not carry over',
      ],
      closing: 'It’s the cheapest test in philosophy and the hardest to answer. Before you defend a conclusion, run your reasoning on something you don’t already believe.',
    },
    dur: 3.2,
  },
];
