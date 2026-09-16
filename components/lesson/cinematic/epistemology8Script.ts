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
    p: 462, x: 196, tower: 1, pile: 3,
    text: 'Suppose a friend tells you the bus comes at eight. You ask what reason your friend has for believing it.',
    dur: 1.8,
  },
  {
    p: 462, x: 196, tower: 1, pile: 3,
    text: 'Your friend gives a reason. You then ask what justifies that reason.',
    dur: 1.8,
  },
  {
    p: 462, x: 196, tower: 1, pile: 3,
    text: 'Each reason can be questioned in the same way. The question is whether this process must ever stop.',
    dur: 1.8,
  },
  {
    p: 42, x: 98, tower: 1, pile: 2, hold: 1,
    text: 'Each reason offered is itself a belief. A belief can justify another only if it is justified itself.',
    cite: 'Every reason needs a reason',
    dur: 3.3,
  },
  {
    p: 42, x: 98, tower: 1, pile: 2, hold: 1,
    text: 'Each block stands for a belief offered as a reason for the belief above it.',
    dur: 1.8,
  },
  {
    p: 43, x: 196, tower: 2, pile: 2,
    text: 'The first reason is that the timetable says so. Because a reason supports the belief above it, the chain grows downward.',
    cite: 'It grows downward',
    dur: 3.1,
  },
  {
    p: 43, x: 196, tower: 2, pile: 2,
    text: 'But the belief that the timetable is correct needs justifying too.',
    dur: 1.9,
  },
  {
    p: 31, x: 98, tower: 2, pile: 1, hold: 1,
    text: 'So a further question arises: why trust the timetable?',
    dur: 1.8,
  },
  {
    p: 31, x: 98, tower: 2, pile: 1, hold: 1,
    text: 'The answer is that the city printed it. That raises the question of why the city should be trusted.',
    dur: 1.8,
  },
  {
    p: 31, x: 98, tower: 2, pile: 1, hold: 1,
    text: 'If every reason needs a further reason, the questions never run out.',
    dur: 1.8,
  },
  {
    p: 27, x: 196, tower: 4, pile: 1,
    text: 'This is the regress problem, which goes back to Aristotle. If each justification needs another, no belief seems finally justified.',
    cite: 'The regress',
    dur: 5.0,
  },
  {
    p: 47, x: 98, tower: 0, pile: 1, esc: 1,
    text: 'The chain of reasons can end in only three ways. First, it may never end, and run on for ever.',
    cite: 'Agrippa’s trilemma',
    dur: 2.1,
  },
  {
    p: 267, x: 98, tower: 0, pile: 1, esc: 1,
    text: 'Second, the chain may loop back in a circle, with beliefs supporting one another. Third, the chain may end in beliefs needing no further support.',
    dur: 2.9,
  },
  {
    p: 21, x: 98, esc: 1, pick: 1,
    interact: {
      prompt: 'Which of the three endings would a view called foundationalism defend?',
      explain:
        'It hits bedrock. Foundationalists hold that some beliefs are basic: justified without resting on other beliefs. Examples offered include a present pain, or that two plus two is four.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 26, x: 176, esc: 1, land: 3,
    text: 'Foundationalism holds that some beliefs are basic. They need no support from other beliefs, and all other beliefs rest on them.',
    cite: 'Foundationalism',
    dur: 3.3,
  },
  {
    p: 416, x: 176, esc: 1, land: 3,
    text: 'On this view, the demand for further reasons finally ends at a basic belief.',
    dur: 1.8,
  },
  {
    p: 165, x: 176, esc: 1, land: 2,
    interact: {
      prompt: 'If beliefs can support one another, which curve shows how support changes as the circle widens?',
      plot: {
        axis: 'HOW MUCH IT JUSTIFIES',
        // THOUSANDS is 54dp of lettering in a 46dp column and was losing its tail.
        // Its neighbours are all figures, so a figure is what it wanted anyway.
        cols: ['2 BELIEFS', '5', '20', '100', '1,000s'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'rise', profile: [0.04, 0.2, 0.5, 0.8, 0.95], reads: 'the wider the web, the more it justifies', correct: true },
          { id: 'flat', profile: [0.06, 0.06, 0.06, 0.06, 0.06], reads: 'a circle justifies nothing at any size' },
          { id: 'fall', profile: [0.9, 0.7, 0.5, 0.3, 0.08], reads: 'the more beliefs, the weaker the support' },
        ],
      },
      explain: 'The wider the web, the more it justifies. A loop of just two beliefs gives no support. Coherentists argue that a large web of mutually supporting beliefs is justified. Critics reply that a coherent web could still be cut off from the world.',
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
        'Every reason seems to need a further reason',
        'The resulting endless chain is the regress problem',
        'Foundationalism ends the chain at basic beliefs',
        'Coherentism finds justification in a web of beliefs',
      ],
      closing: 'Foundationalism and coherentism both answer one question: at what point can the demand for reasons stop?',
    },
    dur: 3.0,
  },
];
