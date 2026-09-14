import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-18, "Equality of What, Really?"
//
// THE PICTURE: two lanes, an identical bicycle at the start of each, and a marker
// showing how far each rider actually got. The inputs are drawn the same because
// they ARE the same; the distances are not (H64).
//
// Sen's argument is easy to nod along with and hard to feel, because "capability"
// is an abstraction and "income" is not. Two lanes make the abstraction the visible
// half: what is equal is at the left-hand end, and what matters is the length.
//
// STAGING: the Q1 decoys are the two things people reach for when told the outcome
// differs — the resource itself, and effort. Effort is the sharper of the two, and
// naming it is what stops the lesson from reading as "some people just try harder"
// (H66).

export interface Pol18Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many lanes are laid out, 0…2. */ lanes?: number;
  /** The identical bicycles at the start of each, 0…1. */ bikes?: number;
  /** How far each rider has actually travelled, 0…1 of their own reach. */ ride?: number;
  /** 1 = the three boards are live targets (Q1). */ pick?: number;
}

export const BEATS: Pol18Beat[] = [
  {
    g: 462, lanes: 2, bikes: 1,
    dur: 4.6,
    text: 'Consider two people who each receive an identical bicycle. In terms of resources, the two are equal.',
  },
  {
    g: 159, lanes: 2, bikes: 1, ride: 1,
    dur: 1.9,
    text: 'Both set off, and one rider crosses the whole city.',
    cite: 'Same bicycle',
  },
  {
    g: 159, lanes: 2, bikes: 1, ride: 1,
    dur: 2.9,
    text: 'The other rider cannot use his legs, so the bicycle takes him almost nowhere.',
  },
  {
    g: 412, lanes: 2, bikes: 1, ride: 1,
    dur: 4.8,
    text: 'The resource was equal at the start, yet it produced very different amounts of mobility.',
    cite: 'Equal resources',
  },
  {
    g: 465, lanes: 2, bikes: 1, ride: 1,
    dur: 3.8,
    quote: {
      id: 'lq-political-political-18-1',
      text: 'What a person has the actual capability to achieve is influenced by economic opportunities, political liberties, social facilities, and the enabling conditions of good health.',
      author: 'Amartya Sen',
      work: 'Development as Freedom',
      era: '1999',
      philosopherId: 'amartya-sen',
      branchSlugs: ['political-philosophy'],
    },
  },
  {
    g: 384, lanes: 2, bikes: 1, ride: 1,
    dur: 4.8,
    text: 'So Amartya Sen measures equality in a new way. He asks what people are able to do and be, and calls this their capabilities.',
    cite: 'Capabilities',
  },
  {
    g: 165, lanes: 2, bikes: 1, ride: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which of these does Sen think equality should track?',
      explain: 'How far they get. The bicycles are already equal, yet one rider gains almost nothing from theirs. Effort isn’t the issue either: the difference comes from what each body can do, not from who tried harder.',
      xp: 5,
    },
  },
  {
    g: 41, lanes: 2, bikes: 1, ride: 1,
    dur: 1.0,
    interact: {
      prompt: 'If two people receive the same income, how equal are their real freedoms?',
      drag: {
        lo: 'THEY ARE NOW EQUAL',
        hi: 'INCOME IS IRRELEVANT',
        start: 0,
        zones: [
          { id: 'equal', upto: 0.3, reads: 'fully equal, since income is what counts' },
          { id: 'means', upto: 0.74, reads: 'equal means, and freedom still deeply unequal', correct: true },
          { id: 'nothing', upto: 1, reads: 'income is irrelevant to freedom' },
        ],
      },
      explain: 'Equal means, and freedom still unequal. Income is a means, not the end. What it buys depends on health, surroundings and what a body can do. So equal income can leave freedoms far apart.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Sen’s Capability Approach',
      points: [
        'Equal resources can convert into very unequal freedoms',
        'Sen measures capabilities: what a person can do and be',
        'Income is an input, not the thing being equalised',
        'Freedom is judged by real ability to act',
      ],
      closing: 'Equality in resources matters for what those resources let each person do.',
    },
    dur: 3.0,
  },
];
