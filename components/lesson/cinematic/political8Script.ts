import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-8, "The Puzzle of Equality" — everyone wants
// equality, but equality of WHAT? Taught at a fence: three onlookers of different
// heights, a match on the far side, and three spare boxes. The figure WALKS the
// boxes across, hands out identical shares, and the shortest one is still staring
// at wood. Q1 is answered at the fence itself (tap who gets the spare box); Q2 is
// A/B/C/D in the deck.
//
// Plain language throughout: the reader redistributes the boxes with their own
// thumb BEFORE anyone says "resources", "opportunity" or "capabilities", so the
// vocabulary arrives as a label for a thing they have already done.

export interface Political8Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 100 = by the box pile, 170 = at the fence. */ x?: number;
  /** Boxes at the fence: 0 none · 1 one each · 2 shared out by need. */ mode?: number;
  /** 1 = the spare boxes are still stacked stage left. */ pile?: number;
  /** 1 = the figure has the boxes in his arms. */ carry?: number;
  /** 1 = the SEES / BLOCKED badges are up over the onlookers. */ marks?: number;
  /** 1 = the level eye-line rule is drawn across the fence. */ eyeline?: number;
  /** 1 = the three onlooker cards are live (Q1). */ pick?: number;
}

export const BEATS: Political8Beat[] = [
  {
    p: 25, x: 100, pile: 1,
    text: 'Three people. One fence. A match on the far side that all three want to watch. Everybody agrees they should get to. Now watch how fast agreeing falls apart.',
    dur: 4.4,
  },
  {
    p: 13, x: 170, pile: 1, marks: 1,
    text: 'Nobody here cheated anybody. They were simply born different heights. The tall one sees the whole pitch. The short one sees a plank of wood.',
    cite: 'Same fence, different eyes',
    dur: 4.4,
  },
  {
    p: 42, x: 100, carry: 1, pile: 1, marks: 1,
    text: 'Luckily somebody left three crates by the gate. Three crates, three people. One each — you cannot get fairer than that. Can you?',
    cite: 'Three spare crates',
    dur: 4.2,
  },
  {
    p: 43, x: 170, pile: 1, mode: 1, marks: 1,
    text: 'One crate each. Same size, same share, nobody favoured, nobody skipped. And the shortest one is still looking at wood.',
    cite: 'Perfectly equal shares',
    dur: 4.6,
  },
  {
    p: 45, x: 170, mode: 1, marks: 1, pick: 1,
    interact: {
      prompt: 'The tallest could already see, so her crate is spare. Tap the onlooker who should get it.',
      explain: 'Only the shortest was still blocked, so that is the one place a crate changes anything. Same three crates, nothing added — and now every pair of eyes clears the fence.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 170, mode: 2, marks: 1, eyeline: 1,
    text: 'Nothing was added and nothing was thrown away. The same three crates, moved to where they actually do something. Look at the eye line now — dead level.',
    cite: 'Same crates, new places',
    dur: 4.6,
  },
  {
    p: 4, x: 100, mode: 2, marks: 1, eyeline: 1,
    interact: {
      prompt: 'Place the token on what the same crates gave them.',
      field: {
        xLo: 'THE SHARES DIFFER', xHi: 'THE SHARES ARE IDENTICAL',
        yLo: 'EVERYONE CAN SEE OVER', yHi: 'SOMEONE STILL CANNOT',
        start: [0.24, 0.24],
        quads: [
          { id: 'crates', x: 1, y: 1, reads: 'identical crates, and one person staring at wood', correct: true },
          { id: 'aim', x: 0, y: 0, reads: 'different shares, and everybody can see: the aim' },
          { id: 'lucky', x: 1, y: 0, reads: 'identical shares that happened to work for all' },
          { id: 'bad', x: 0, y: 1, reads: 'different shares, and somebody still cannot see' },
        ],
      },
      explain: 'Top right. Equal and identical feel like the same word and they are not: the crates were perfectly equal in resources and left one person facing a plank. Equal shares and equal outcomes come apart, which is why the second arrangement is the fairer one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 3, x: 170, mode: 2, marks: 1, eyeline: 1,
    text: 'So equality is a blank waiting to be filled in. Equal resources? Equal chances? Equal happiness? Amartya Sen and Martha Nussbaum answer differently: equal capabilities — what a person is actually able to do and be.',
    cite: 'Equality of what?',
    dur: 5.4,
  },
  {
    p: 129, x: 100, mode: 2, marks: 1, eyeline: 1,
    quote: {
      id: 'lq-political-political-8-1',
      text: 'Human diversity is no secondary complication … it is a fundamental aspect of our interest in equality.',
      author: 'Amartya Sen',
      work: 'Inequality Reexamined',
      era: '1992',
      philosopherId: 'amartya-sen',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    summary: {
      title: 'Equality of What?',
      points: [
        'Everyone wants equality — of what, though?',
        'Resources, opportunity, welfare, or capabilities',
        'Identical shares can leave people unequally off',
        'Sen and Nussbaum: what people can do',
      ],
      closing: 'Next time someone demands equality, ask them to finish the sentence.',
    },
    dur: 3.0,
  },
];
