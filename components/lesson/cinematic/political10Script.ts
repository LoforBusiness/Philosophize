import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-10, "Property and Distribution" — Locke, Nozick and
// Rawls, argued over ONE picture.
//
// THE PICTURE: an unequal stack of holdings — three columns of very different
// heights — with a HISTORY TAPE running along underneath them, four marks reading
// ACQUIRED · TRADED · TRADED · GIFTED. Over the lesson the same stack is read twice
// and gets opposite verdicts. Nozick reads only the tape, so a reading head travels
// it left to right and stops: clean at every step, therefore just. Rawls never looks
// at the tape, so a level comes down across the tops instead and settles on the
// SHORTEST column, which lights up. Nothing about the stack changes; only what is
// being read.
//
// Q1 is A/B/C/D in the deck — Locke's proviso is the nuanced one, and the options
// have to be read (E34). Q2 is answered ON the stage: two plates, tap the one Nozick
// actually reads.

export interface Political10Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 44 = downstage left, 108 = beside the board. */ x?: number;
  /** 1 = the record is written into the tape (the empty strip is always there). */ tape?: number;
  /** The reading head on the tape: 0 = none · 1–4 = which mark it sits on. */ ptr?: number;
  /** 1 = Rawls's level has come down and settled on the shortest column. */ ruler?: number;
  /** 1 = the two answer plates are live, stage left (Q2). */ plates?: number;
  /** 1 = each column states its own size, and the figures are ruled through. */ sizes?: number;
  /** 1 = a dashed enclosure round the whole stack: it is held in common. */ common?: number;
  /** 1 = the first holding fills, and says what filled it. */ labour?: number;
  /** 1 = the four marks are read out in order, one underline at a time. */ story?: number;
  /** 1 = the tallest column is stamped STILL JUST. */ just?: number;
  /** 1 = the shortest column is asked to rise. */ rise?: number;
}

export const BEATS: Political10Beat[] = [
  {
    p: 164, x: 44,
    text: 'Consider three people whose holdings differ: the largest pile is three times the smallest. Is that distribution unjust?',
    dur: 1.8,
  },
  {
    p: 164, x: 44,
    sizes: 1,
    text: 'The sizes of the piles alone don’t settle the question. Locke, Nozick and Rawls each look for something different.',
    dur: 2,
  },
  {
    p: 272, x: 44,
    common: 1,
    text: 'John Locke begins before anything is owned. In his account, the earth is first given to humankind in common.',
    cite: 'Locke · labour',
    dur: 1.8,
  },
  {
    p: 272, x: 44,
    labour: 1,
    text: 'You own your labour, so land you mix your labour with becomes yours. Locke adds a proviso: enough, and as good, must be left for others.',
    dur: 3.6,
  },
  {
    p: 13, x: 108, tape: 1,
    text: 'So every holding has a history as well as a size. The history records how it was acquired and passed on.',
    cite: 'The record',
    dur: 2.7,
  },
  {
    p: 266, x: 108, tape: 1,
    story: 1,
    text: 'This one was taken from common land, traded twice and then given as a gift.',
    dur: 1.8,
  },
  {
    p: 168, x: 108, tape: 1, ptr: 4,
    text: 'Robert Nozick looks only at this history. He asks whether the first taking was just and every transfer free.',
    cite: 'Nozick · the entitlement view',
    dur: 3.2,
  },
  {
    p: 168, x: 108, tape: 1, ptr: 4,
    just: 1,
    text: 'If every step was just, Nozick holds, the final holding is just, however large.',
    dur: 1.8,
  },
  {
    p: 137, x: 108, tape: 1, ptr: 4,
    quote: {
      id: 'lq-political-political-10-1',
      text: 'Taxation of earnings from labor is on a par with forced labor.',
      author: 'Robert Nozick',
      philosopherId: 'robert-nozick',
      work: 'Anarchy, State, and Utopia',
      era: '1974',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    p: 47, x: 108, tape: 1, ptr: 4, ruler: 1,
    text: 'John Rawls judges the distribution rather than its history. He asks how well the least advantaged fare.',
    cite: 'Rawls · the floor',
    dur: 3,
  },
  {
    p: 267, x: 108, tape: 1, ptr: 4, ruler: 1,
    rise: 1,
    text: 'Rawls permits inequality only if it improves the position of whoever is worst off.',
    dur: 2,
  },
  {
    p: 177, x: 108, tape: 1, ptr: 4, ruler: 1,
    interact: {
      prompt: 'Under Locke’s proviso, how much of the common land may one person take?',
      drag: {
        lo: 'NOTHING AT ALL',
        hi: 'ALL YOU CAN REACH',
        start: 1,
        zones: [
          { id: 'none', upto: 0.26, reads: 'nothing, the land stays common' },
          { id: 'enough', upto: 0.74, reads: 'as much as leaves enough for others', correct: true },
          { id: 'all', upto: 1, reads: 'all you can take, whatever is left for others' },
        ],
      },
      explain: 'As much as leaves enough for others. A labour theory of property can seem to permit unlimited taking. Locke allows it only while enough, and as good, remains for others.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, x: 108, tape: 1, ptr: 4, ruler: 1, plates: 1,
    interact: {
      prompt: 'To decide whether these holdings are just, what does Nozick’s theory examine?',
      explain: 'The history tape. Nozick judges holdings by how they came about, not by how unequal they look. If each step was just, the result is just. But a neat pattern can’t make a stolen holding just.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 445, x: 108, tape: 1, ptr: 4, ruler: 1,
    summary: {
      title: 'Property and Distributive Justice',
      points: [
        'Locke: labour creates property, within a proviso',
        'Nozick: judge holdings by their history',
        'Rawls: judge a distribution by its worst off',
        'Nozick and Rawls reach opposite verdicts on one distribution',
      ],
      closing: 'Two questions recur throughout political philosophy: who may rule, and who may own property.',
    },
    dur: 3.0,
  },
];
