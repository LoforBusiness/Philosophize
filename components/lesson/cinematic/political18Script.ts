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
    g: 25, lanes: 2, bikes: 1,
    dur: 4.6,
    text: 'Two people, one bicycle each, and the bicycles are identical. So far this is as equal as anything gets.',
  },
  {
    g: 159, lanes: 2, bikes: 1, ride: 1,
    dur: 1.9,
    text: 'Now let them go. One crosses the city.',
    cite: 'Same bicycle',
  },
  {
    g: 159, lanes: 2, bikes: 1, ride: 1,
    dur: 2.9,
    text: 'The other cannot use their legs and gets almost nowhere at all.',
  },
  {
    g: 412, lanes: 2, bikes: 1, ride: 1,
    dur: 4.8,
    text: 'Nothing unfair happened at the start. The resource was equal. It turned into wildly different amounts of getting about.',
    cite: 'Equal input',
  },
  {
    g: 137, lanes: 2, bikes: 1, ride: 1,
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
    text: 'So Sen moves the question. Stop measuring what people hold and measure what their lives actually let them do.',
    cite: 'Capabilities',
  },
  {
    g: 4, lanes: 2, bikes: 1, ride: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what Sen says we should be equalising.',
      explain: 'How far they get. The bicycles are already equal and it bought one of them almost nothing. The board about effort is the one to be careful with. Nothing here is a story about who tried hardest, and reading it that way loses the argument.',
      xp: 5,
    },
  },
  {
    g: 41, lanes: 2, bikes: 1, ride: 1,
    dur: 1.0,
    interact: {
      prompt: 'Drag to what the same pay has really bought them.',
      drag: {
        lo: 'THEY ARE NOW EQUAL',
        hi: 'INCOME SAYS NOTHING AT ALL',
        start: 0,
        zones: [
          { id: 'equal', upto: 0.3, reads: 'equal now, money is what counts' },
          { id: 'means', upto: 0.74, reads: 'equal means, and freedom still deeply unequal', correct: true },
          { id: 'nothing', upto: 1, reads: 'income has nothing to do with it whatever' },
        ],
      },
      explain: 'The middle. The near end mistakes the means for the end: income is an input, and how much of a life it buys depends on health, on where you live, on what a body can do. Equal resources can leave real freedom a very long way apart.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Equality of What',
      points: [
        'Equal resources can convert into very unequal freedoms',
        'Sen measures capabilities: what a life actually permits',
        'Income is an input, not the thing being equalised',
        'This is positive liberty made measurable',
      ],
      closing: 'The bicycle was never the point. Getting where you wanted to go was.',
    },
    dur: 3.0,
  },
];
