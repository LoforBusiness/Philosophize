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
}

export const BEATS: Ethics33Beat[] = [
  {
    p: 25, x: 48, give: 0,
    text: 'Your column on the left, theirs on the right. Nobody thinks you should keep all of it and nobody thinks you should keep none.',
    dur: 4.0,
  },
  {
    p: 47, x: 48, give: 0.15,
    text: 'So you give something, and the giving plainly helps. That much is easy, and almost every view of ethics agrees.',
    cite: 'The easy part',
    dur: 4.0,
  },
  {
    p: 19, x: 48, give: 0.15, more: 1,
    text: 'Then comes the awkward question. There is still another life over there you could reach with a bit more. What exactly says you may stop?',
    cite: 'And another one',
    dur: 4.6,
  },
  {
    p: 4, x: 48, give: 0.9, more: 1,
    text: 'Follow the rule honestly and the giving does not stop until the two columns are level. Peter Singer thought that was the right answer and that we had simply been looking away.',
    cite: 'Singer bites the bullet',
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
    p: 4, x: 48, give: 0, live: 1,
    interact: {
      prompt: 'Drag your column across. Stop where giving stops being required and starts being heroic.',
      drag: {
        lo: 'KEEP IT ALL',
        hi: 'LEVEL WITH THEM',
        start: 0,
        zones: [
          { id: 'token', upto: 0.22, reads: 'less than you could' },
          { id: 'real', upto: 0.58, reads: 'a real cost to you', correct: true },
          { id: 'saint', upto: 1, reads: 'nothing left of your life' },
        ],
      },
      explain: 'Most people land somewhere in the middle and cannot defend the exact spot, which is honest. What the argument shows is that the far end follows from premises you already accepted at the pond. And that nobody has a clean reason to get off before it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 48, give: 0.45,
    text: 'Susan Wolf pushed back from the other side. A life given over entirely to duty is not the best human life, she argued. It is a narrowed one.',
    cite: 'Wolf, on moral saints',
    dur: 4.8,
  },
  {
    p: 45, x: 48, give: 0.45,
    interact: {
      prompt: 'Singer replies that a demanding conclusion is not a false one. Fair?',
      cards: [
        { text: 'Partly, on both sides', correct: true },
        { text: 'No, too hard means wrong', correct: false },
      ],
      explain: 'Difficulty is not disproof, and we would not accept "too demanding" from somebody refusing to wade into the pond. But a settled, near-universal reaction is evidence about morality rather than noise. That is why this argument is still going.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Where The Line Sits',
      points: [
        'The pond argument does not stop at one donation',
        'Followed strictly it leaves you nothing of your own',
        'Wolf: a life of pure duty is narrowed, not ideal',
        'Difficulty is not disproof — but it is evidence',
      ],
      closing: 'Almost nobody defends the far end of that line. Almost nobody can say why it is wrong.',
    },
    dur: 3.0,
  },
];
