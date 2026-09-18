import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-41, "One Detail Too Many"
// Theme: A BOX INSIDE A BOX, AND THE INNER ONE STRAINING AT THE WALL.
//
// The conjunction rule is a fact about CONTAINMENT, so the scene draws the
// containment and nothing else. Every teller-and-activist is a teller, so the
// inner box lives inside the outer one — and the reader's drag can push it right
// up to the wall and no further, because there is nowhere further to go.
//
// That limit is the lesson and it is enforced by the geometry rather than stated.
// A control that let the inner box grow past the outer would be drawing something
// arithmetic forbids, which is A1 broken in the one place the lesson cannot afford
// it.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what makes the
//     longer description feel likelier. On the stage because the two boxes are
//     already sitting there disagreeing with the intuition.
//   · beat 8  a DRAG — the inner box itself, grown as far as the reader thinks it
//     goes. It stops at the wall on its own, which is the whole argument arriving
//     under their thumb.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic41Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the outer group of all bank tellers is drawn. */ outer?: number;
  /** 1 = the inner group and the legend under it are drawn. */ inner?: number;
  /** How much of the outer box the inner one fills, 0…1. */ fill?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /**
   * 1 = a dot travels once from inside the inner box down into the gap between
   * the inner box's floor and the outer box's — showing that a member of the
   * smaller group is still inside the larger one.
   */
  member?: number;
  /**
   * 1 = a bracket above the outer box narrows once, from the outer box's own
   * width down to the inner box's current width — showing how an added detail
   * narrows a claim to fewer cases.
   */
  narrows?: number;
}

export const BEATS: Logic41Beat[] = [
  {
    p: 420, x: 28,
    text: 'Consider Linda, who’s thirty-one, single and outspoken. As a student, she studied philosophy and cared about social justice.',
    dur: 4.0,
  },
  {
    p: 161, x: 28, outer: 1,
    text: 'Is it more probable that Linda is a bank teller, or a bank teller who’s also an activist?',
    dur: 4.8,
  },
  {
    p: 386, x: 28, outer: 1, inner: 1, fill: 0.34,
    text: 'Most people choose the second, because the added detail matches Linda’s description.',
    dur: 4.4,
  },
  {
    p: 263, x: 28, outer: 1, inner: 1, fill: 0.34, member: 1,
    text: 'However, every activist bank teller is a bank teller. So the second group is a subset of the first.',
    dur: 4.6,
  },
  {
    p: 260, x: 28, outer: 1, inner: 1, fill: 0.34, plates: 1, live: 1,
    interact: {
      prompt: 'Why does the longer description seem more probable?',
      explain: 'The description fits her. Most people judge by how well Linda matches each option, a shortcut called the representativeness heuristic. A more precise claim is less likely, not more. And two claims together are less likely than one, so that can’t be the reason.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 434, x: 88, outer: 1, inner: 1, fill: 0.34,
    text: 'Amos Tversky and Daniel Kahneman named this error the conjunction fallacy in 1983. Most people they tested made the error, even students trained in statistics.',
    dur: 5.0,
  },
  {
    p: 425, x: 88, outer: 1, inner: 1, fill: 0.34,
    quote: {
      id: 'lq-logic-arguments-41-1',
      text: 'A conjunction cannot be more probable than one of its constituents.',
      author: 'Amos Tversky and Daniel Kahneman',
      work: 'Extensional versus Intuitive Reasoning',
      era: '1983',
      branchSlugs: ['logic'],
    },
    dur: 4.2,
  },
  {
    p: 446, x: 88, outer: 1, inner: 1, fill: 0.34, narrows: 1,
    text: 'Adding a detail narrows a claim, so the claim fits the same cases or fewer. Detail can make a story more convincing while never making it more probable.',
    dur: 4.2,
  },
  {
    p: 257, x: 88, outer: 1, inner: 1,
    interact: {
      prompt: 'Compared with all bank tellers, how large is the group of activist tellers likely to be?',
      drag: {
        lo: 'A FEW',
        hi: 'ALL OF THEM',
        start: 0.95,
        zones: [
          { id: 'slice', upto: 0.45, reads: 'a small part of the tellers', correct: true },
          { id: 'most', upto: 0.8, reads: 'most tellers, which nothing in the evidence suggests' },
          { id: 'all', upto: 1, reads: 'all tellers, only if every teller is an activist' },
        ],
      },
      explain: 'A small part of the tellers. The group could equal all tellers only if every teller were an activist, which is unlikely. Linda’s description can’t make the group bigger. It says nothing about how many tellers are activists.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 88, outer: 1, inner: 1, fill: 0.34,
    summary: {
      title: 'The Conjunction Fallacy',
      points: [
        'Every case of a conjunction is a case of each part',
        'So a conjunction is never more probable than either part',
        'Judging by resemblance makes the conjunction seem likelier',
        'Added detail can raise resemblance but never probability',
      ],
      closing: 'A forecast with names, dates and a motive is more convincing than a bare one. Yet each added detail is another way for the forecast to be wrong.',
    },
    dur: 4.6,
  },
];
