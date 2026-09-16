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
    p: 164, x: 100, pile: 1,
    text: 'Consider three people standing at a tall wooden fence.',
    dur: 1.8,
  },
  {
    p: 164, x: 100, pile: 1,
    text: 'A match is being played on the far side, and all three want to watch. Everyone agrees that each of them should be able to.',
    dur: 2.7,
  },
  {
    p: 164, x: 100, pile: 1,
    text: 'The agreement ends as soon as anyone asks what equal shares actually require.',
    dur: 1.8,
  },
  {
    p: 13, x: 170, pile: 1, marks: 1,
    text: 'No one has wronged anyone here. The three differ in height through no choice of their own.',
    cite: 'Same fence, different heights',
    dur: 1.8,
  },
  {
    p: 266, x: 170, pile: 1, marks: 1,
    text: 'The tallest sees the whole pitch. The other two see only the fence.',
    dur: 2.6,
  },
  {
    p: 42, x: 100, carry: 1, pile: 1, marks: 1,
    text: 'There are three spare crates by the gate, one for each person.',
    cite: 'Three spare crates',
    dur: 2.2,
  },
  {
    p: 42, x: 100, carry: 1, pile: 1, marks: 1,
    text: 'One crate each looks like the fairest possible division.',
    dur: 2,
  },
  {
    p: 43, x: 170, pile: 1, mode: 1, marks: 1,
    text: 'Each person receives an identical crate. The shares are equal, and no one is favoured or left out.',
    cite: 'Equal shares',
    dur: 2.5,
  },
  {
    p: 43, x: 170, pile: 1, mode: 1, marks: 1,
    text: 'Yet the shortest person still can’t see over the fence.',
    dur: 2.1,
  },
  {
    p: 447, x: 170, mode: 1, marks: 1, pick: 1,
    interact: {
      prompt: 'If the tallest can see without her crate, who should receive it?',
      explain: 'The shortest. The middle one could already see, so an extra crate only makes a difference to the shortest. With no crate added, all three now see over the fence.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 170, mode: 2, marks: 1, eyeline: 1,
    text: 'Nothing was added and nothing was taken away. The same three crates now sit where they make a difference.',
    cite: 'Same crates, new places',
    dur: 3.1,
  },
  {
    p: 267, x: 170, mode: 2, marks: 1, eyeline: 1,
    text: 'All three now see the match from the same eye level.',
    dur: 1.8,
  },
  {
    p: 165, x: 100, mode: 2, marks: 1, eyeline: 1,
    interact: {
      prompt: 'Which measure of equality counts the identical crates as an equal division?',
      poll: {
        options: [
          { id: 'crates', reads: 'resources, such as income and wealth', holders: ['John Rawls', 'Ronald Dworkin'], correct: true },
          { id: 'aim', reads: 'capabilities: what each person can do and be', holders: ['Amartya Sen', 'Martha Nussbaum'] },
          { id: 'lucky', reads: 'opportunity for welfare', holders: ['Richard Arneson'] },
          { id: 'bad', reads: 'access to advantage', holders: ['G.A. Cohen'] },
        ],
      },
      explain: 'Resources, such as income and wealth. Each person got an identical crate, so resources were equal. Yet one still couldn’t see, which a capability measure counts as inequality.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 456, x: 170, mode: 2, marks: 1, eyeline: 1,
    text: 'So a demand for equality is incomplete until it states what should be equal.',
    cite: 'Equality of what?',
    dur: 1.8,
  },
  {
    p: 456, x: 170, mode: 2, marks: 1, eyeline: 1,
    text: 'Should it be equal resources, equal opportunities or equal happiness?',
    dur: 1.8,
  },
  {
    p: 456, x: 170, mode: 2, marks: 1, eyeline: 1,
    text: 'Amartya Sen and Martha Nussbaum look at what people can do. They call these capabilities: what a person is able to do or to be.',
    dur: 3,
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
        'A demand for equality must say what is equal',
        'Resources, opportunity, welfare, or capabilities',
        'Identical shares can leave people unequally off',
        'Sen and Nussbaum: measure what people are able to do',
      ],
      closing: 'Different answers to the question “equality of what?” lead to different policies for the same people.',
    },
    dur: 3.0,
  },
];
