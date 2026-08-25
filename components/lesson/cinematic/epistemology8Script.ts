import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-8, "What Makes a Belief Justified?" — the
// regress of reasons, built as a TOWER OF BECAUSE-BLOCKS that grows DOWNWARD.
// The figure hauls a block from the pile stage-left, walks it across, and wedges
// it under the last one; block after block, and the tower never reaches a floor.
//
// Then the only three exits are laid out side by side — it never ends, it loops
// in a circle, or it lands on bedrock — and the reader taps the one that earns
// the name "foundationalism" BEFORE the word is ever explained. Q2 is A/B/C/D
// and turns on the tempting idea that any circle of reasons is worthless.
//
// Plain language throughout: "regress", "foundationalism" and "coherentism" only
// arrive after the reader has already watched (or chosen) the thing they name.

export interface Epi8Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 98 = the block pile · 196 = the tower · 176 = the escapes. */ x?: number;
  /** How many tower rows are shown: 1 claim · 2 · 3 · 4 (the last is the dashed "…and so on?"). 0 = gone. */ tower?: number;
  /** How many spare blocks are left in the pile (0..3). */ pile?: number;
  /** 1 = the figure is carrying a block. */ hold?: number;
  /** 1 = the three escape cards are on stage. */ esc?: number;
  /** Highlight one escape after the question: 1 never-ends · 2 circle · 3 bedrock. */ land?: number;
  /** 1 = the escape cards are live targets (Q1). */ pick?: number;
}

export const BEATS: Epi8Beat[] = [
  {
    p: 25, x: 196, tower: 1, pile: 3,
    text: 'Your friend swears the bus comes at eight. You ask why. He answers. You ask why again. How many times can he do that before he runs out?',
    dur: 4.0,
  },
  {
    p: 42, x: 98, tower: 1, pile: 2, hold: 1,
    text: 'Every answer he gives is just another belief. And a belief holds nothing up unless something holds it up first. So off he goes to fetch one.',
    cite: 'Every reason needs a reason',
    dur: 4.4,
  },
  {
    p: 43, x: 196, tower: 2, pile: 2,
    text: 'He wedges it underneath: the timetable says so. Support goes under, never on top, so this tower grows downward. And now the timetable is a belief that needs propping up too.',
    cite: 'It grows downward',
    dur: 5.0,
  },
  {
    p: 31, x: 98, tower: 2, pile: 1, hold: 1,
    text: 'Back to the pile. Why trust the timetable? The city printed it. Why trust the city? You can already hear the next why coming.',
    dur: 4.2,
  },
  {
    p: 27, x: 196, tower: 4, pile: 1,
    text: 'Block after block, and still no floor. Reasons marching backwards with nothing to land on has a name: the regress. It is the oldest crack in the whole idea of justification.',
    cite: 'The regress',
    dur: 5.0,
  },
  {
    p: 47, x: 98, tower: 0, pile: 1, esc: 1,
    text: 'The chain of reasons can end in only three ways. The chain runs on for ever. The chain curls into a circle, each block leaning on the next. Or the chain lands on something that needs nothing beneath.',
    cite: 'Three ways out',
    dur: 5.0,
  },
  {
    p: 21, x: 98, esc: 1, pick: 1,
    interact: {
      prompt: 'One of those three is what philosophers call FOUNDATIONALISM. Tap it.',
      explain:
        'A foundation is the thing everything else sits on, and that sits on nothing. Foundationalists say a few beliefs are like that — the pain you feel right now, or two plus two — bedrock that ends the digging.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 26, x: 176, esc: 1, land: 3,
    text: 'So the digging stops. Foundationalists say a handful of basic beliefs hold themselves up, and the entire tower rests on those. Hit bedrock, and "why?" finally has nowhere left to go.',
    cite: 'Foundationalism',
    dur: 4.8,
  },
  {
    p: 4, x: 176, esc: 1, land: 2,
    interact: {
      prompt: 'The circle instead: beliefs propping each other up, nothing underneath. Is a loop of reasons worthless?',
      cards: [
        { text: 'A wide enough web holds', correct: true },
        { text: 'Circles are always worthless', correct: false },
      ],
      explain: 'The trap: "circular reasoning" is a famous insult, so "always worthless" sounds obviously right. A two-step loop really is empty — but coherentists argue a huge, tightly knit web holds itself up. The sharper objection: a consistent web can still be false.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 141, x: 98, esc: 1, land: 2,
    quote: {
      id: 'lq-epistemology-knowledge-8-1',
      text: 'It is wrong always, everywhere, and for anyone, to believe anything upon insufficient evidence.',
      author: 'William Kingdon Clifford',
      work: 'The Ethics of Belief',
      era: '1877',
      branchSlugs: ['epistemology'],
    },
    dur: 3.6,
  },
  {
    summary: {
      title: 'Where Reasons Rest',
      points: [
        'Every reason leans on another reason',
        'That endless backward march is the regress',
        'Foundationalism stops at self-supporting bedrock',
        'Coherentism trusts a web, not a floor',
      ],
      closing: 'Bedrock or web — both are answers to one stubborn question: when may you finally stop asking why?',
    },
    dur: 3.0,
  },
];
