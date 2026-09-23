import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-33, "How Much Is Morally Required?" — the DRAG mechanic
// (../DragScale) on the one question it was most obviously invented for.
//
// Two columns of coins, yours and theirs. Dragging moves coins from one to the
// other, and the readout names what the reader has just done: "generous",
// "unusually generous", "as poor as they are". The point of making this a drag
// rather than two cards is that a card would answer it — the entire difficulty of
// demandingness is that the line is somewhere on a continuum and nobody can say
// where, so a mechanic with two positions on it would be lying about the subject.
//
// The graded answer is therefore deliberately NOT the far end. It is the place the
// argument stops obviously applying, and the explanation says plainly that this is
// contested rather than settled.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics33Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How much has moved across, 0 (nothing) … 1 (you are level with them). */ give?: number;
  /** 1 = the reader is driving the transfer from the rail (Q1). */ live?: number;
  /** 1 = the "STILL ANOTHER LIFE" tag is showing above the far column. */ more?: number;
  /** 1 = a "?" holds in the gap between the columns, for the open question of
   *  where giving may stop. */ ask?: number;
  /** 1 = a dashed bracket presses in around the "YOURS" label, for the life it
   *  crowds out. */ squeeze?: number;
}

export const BEATS: Ethics33Beat[] = [
  {
    p: 379, x: 48, give: 0,
    text: 'Suppose you could give part of what you have to people in severe poverty. The question is how much morality requires you to give.',
    dur: 4.0,
  },
  {
    p: 47, x: 48, give: 0.15,
    text: 'Giving some of it helps, and the major ethical theories agree that some giving is required. The dispute concerns how much.',
    cite: 'Common ground',
    dur: 4.0,
  },
  {
    p: 19, x: 48, give: 0.15, more: 1,
    text: 'Yet after each gift, there’s still another life that a little more could help.',
    cite: 'A further life',
    dur: 3.5,
  },
  {
    p: 169, x: 48, give: 0.15, more: 1, ask: 1,
    text: 'So the question is what, if anything, permits you to stop giving.',
    dur: 1.8,
  },
  {
    p: 380, x: 48, give: 0.9, more: 1,
    text: 'Taken strictly, Peter Singer’s principle says to keep giving until more would cost you as much as it helps others. Singer accepts this.',
    cite: 'Singer’s strict conclusion',
    dur: 5.0,
  },
  {
    p: 137, x: 48, give: 0.9,
    quote: {
      id: 'lq-ethics-ethics-33-1',
      text: 'A moral saint will have to be very nice indeed, and it is unlikely that he will be funny.',
      author: 'Susan Wolf',
      work: 'Moral Saints',
      era: '1982',
      branchSlugs: ['ethics'],
    },
    dur: 3.8,
  },
  {
    p: 455, x: 48, give: 0, live: 1,
    interact: {
      prompt: 'Put these in order, from smallest cost to largest.',
      order: {
        axis: 'SMALLEST COST FIRST',
        items: [
          { id: 'small', reads: 'A GIFT YOU HARDLY FEEL' },
          { id: 'real', reads: 'A SACRIFICE YOU FEEL' },
          { id: 'all', reads: 'NOTHING LEFT FOR YOURSELF' },
        ],
      },
      explain: 'Duty runs out somewhere in the middle. Below it the giving costs you nothing worth counting; past the far end a morality has consumed the life that was supposed to be lived by its lights, which is an argument against the demand rather than for it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 459, x: 48, give: 0.45,
    text: 'Susan Wolf objects from the opposite direction. She argues that a life devoted wholly to morality is not the best life for a person.',
    cite: 'Wolf, on moral saints',
    dur: 3.9,
  },
  {
    p: 459, x: 48, give: 0.45, squeeze: 1,
    text: 'In Wolf’s view, such a life crowds out the non-moral interests and talents that make up a rich, well-rounded character.',
    dur: 1.8,
  },
  {
    p: 447, x: 48, give: 0.45,
    interact: {
      prompt: 'Singer replies that a demanding conclusion isn’t thereby false. Is that reply sound?',
      cards: [
        { text: 'Partly: evidence, not disproof', correct: true },
        { text: 'No: excessive demands refute a theory', correct: false },
      ],
      explain: 'Partly: demandingness is evidence, not disproof. “Too demanding” doesn’t excuse leaving a child to drown in the pond. Yet a reaction shared by nearly everyone is some evidence about what morality requires.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'How Much Morality Demands',
      points: [
        'The pond argument does not stop at one donation',
        'Applied strictly, it leaves you little beyond bare necessities',
        'Wolf argues a wholly moral life is not the best life',
        'Demandingness doesn’t disprove a view, but it counts as evidence',
      ],
      closing: 'The strict conclusion is rarely accepted, yet no principle for stopping short of it has won agreement.',
    },
    dur: 3.0,
  },
];
