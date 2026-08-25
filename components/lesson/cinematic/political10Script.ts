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
}

export const BEATS: Political10Beat[] = [
  {
    p: 25, x: 44,
    text: 'Three people, three piles — and the tallest is three times the shortest. Is that unjust? Stare at it as long as you like: the picture on its own will not tell you.',
    dur: 3.8,
  },
  {
    p: 37, x: 44,
    text: 'Locke starts before the piles exist. The world lies there unowned; you work a patch of it, and because the work is yours the patch becomes yours. But he bolts a brake onto that: leave enough, and as good, for everyone else.',
    cite: 'Locke · labour',
    dur: 5.0,
  },
  {
    p: 13, x: 108, tape: 1,
    text: 'So a pile is never only a pile. Under every one runs a record of how it got there. Taken from the common, traded, traded again, handed on as a gift.',
    cite: 'The record',
    dur: 4.4,
  },
  {
    p: 3, x: 108, tape: 1, ptr: 4,
    text: 'Nozick reads only that strip. Was every step clean — a fair taking, then free trades, then a gift nobody was forced to give? Then the pile at the end is hers, however tall it stands.',
    cite: 'Nozick · the entitlement view',
    dur: 4.8,
  },
  {
    p: 137, x: 108, tape: 1, ptr: 4,
    quote: {
      id: 'lq-political-political-10-1',
      text: 'Taxation of earnings from labor is on a par with forced labor.',
      author: 'Robert Nozick',
      work: 'Anarchy, State, and Utopia',
      era: '1974',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    p: 47, x: 108, tape: 1, ptr: 4, ruler: 1,
    text: 'Rawls never looks at the strip at all. Lay a level across the tops and read one number — how high is the shortest pile? Inequality is fine by him, but only if it lifts whoever ends up at the bottom.',
    cite: 'Rawls · the floor',
    dur: 5.0,
  },
  {
    p: 21, x: 108, tape: 1, ptr: 4, ruler: 1,
    interact: {
      prompt: 'Locke defended private property. So did he hand owners an unlimited right to grab all they could reach?',
      cards: [
        { text: 'No, leave enough for others', correct: true },
        { text: 'Yes, grab what you reach', correct: false },
      ],
      explain: 'The trap is that defending property sounds like defending endless grabbing. Locke built a brake into the theory instead. You may take from the common land only while enough, and as good, is left for everybody behind you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, x: 108, tape: 1, ptr: 4, ruler: 1, plates: 1,
    interact: {
      prompt: 'Nozick has to rule on this stack. Tap the one thing he actually reads.',
      explain: 'He judges the history, never the shape. Clean taking, free trades, a real gift — then the stack is hers however lopsided it looks. The trap: an ugly pattern feels like proof of injustice, and a tidy one cannot launder a stolen holding.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 9, x: 108, tape: 1, ptr: 4, ruler: 1,
    summary: {
      title: 'Who Owns What, and Why',
      points: [
        'Locke: work makes it yours, within a limit',
        'Nozick: judge the record, never the pattern',
        'Rawls: judge the pattern by its shortest column',
        'Every economy runs on one of these answers',
      ],
      closing: 'Political philosophy keeps circling two questions: who may rule, and who may own.',
    },
    dur: 3.0,
  },
];
