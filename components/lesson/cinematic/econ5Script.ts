import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic economics-foundations-5, "The Rat-Tail Reward" — the fifth lesson on the
// Economics road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A MEDIEVAL TOWN HALL, A SACK OF SILVER COINS, AND A CELLAR FULL OF RATS.
//
// Three people talk, and nobody narrates. The mayor of a rat-plagued town (the plain
// mascot) pays a silver coin for every rat tail; the town’s most successful rat catcher
// (the woman with the bun) has hardly left her cellar; an economist (the top hat) comes in
// from the street with a lantern and finds out why there are more rats than ever.
//
// A ROAD THAT RAMPS UP (group AU): this road has taught scarcity, supply and demand,
// opportunity cost and trade. This lesson uses supply and demand to explain something
// stranger, and it is harder: three ideas — an incentive is a reward that changes what
// people do · people chase the reward, not what you meant · reward the result you want,
// not something easy to make more of. Its first question is asked BEFORE anything is
// explained, and its second offers a tempting fix that fails the same way.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Econ5Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * decree — the mayor stands behind his table and taps the sack of coins ·
   * basket — the catcher sets a basket of tails on the table, and the mayor counts coins into her hand ·
   * lantern — she steps aside; a rat runs out from behind the cabbage crate and under the dais; the economist walks in from the street door on the left with a lantern and tips his hat ·
   * farm — the catcher lifts the cellar hatch, proud, and rats peep over its edge ·
   * incentive — the economist takes a coin out of his waistcoat and holds it up between finger and thumb ·
   * supply — he sets his lantern on the table, takes a tail out of her basket and holds it up in the other hand, then nods at the hatch ·
   * blame — the mayor folds his arms and sniffs ·
   * want — the economist puts the tail back, steps toward the arch and points out through it at the street; the mayor tips three draft decrees over the front of his table, where they unroll ·
   * cabbages — the catcher drops the hatch shut and picks up a cabbage from the crate by the door ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'decree' | 'basket' | 'lantern' | 'farm' | 'incentive' | 'supply' | 'blame' | 'want' | 'cabbages' | 'rest';
  /** The economist is on the stage. He walks in on `lantern`. */
  econ?: boolean;
  /** The cellar hatch: 0 shut · 1 open, with rats at its edge. */
  hatch?: number;
  /**
   * First question on the stage — LOOK BEHIND A DOOR: the cellar hatch, the bakery door and
   * the lid of the well are the things to tap. It is asked before anything is explained;
   * the right one opens.
   */
  peek?: boolean;
  /**
   * Second question on the stage — SEAL A DECREE: three scrolls hanging over the front of the mayor’s table, TWO
   * COINS A TAIL, A COIN PER DEAD RAT and A COIN PER RAT-FREE STREET, are the things to tap;
   * the right one takes the mayor’s wax seal.
   */
  decree?: boolean;
}

export const BEATS: Econ5Beat[] = [
  {
    bed: 'square',
    sfx: [{ id: 'coin', at: 1.35, gain: 0.7 }],
    act: 'decree', hatch: 0,
    speaker: 'plain',
    text: 'As mayor, I’ve solved the rat problem. One silver coin for every rat tail brought to me.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'coin', at: 1.8, gain: 0.8 }, { id: 'coin', at: 3.4, gain: 0.8 }],
    act: 'basket', hatch: 0,
    speaker: 'bun',
    text: 'Fifty tails today! I’m the best rat catcher in town, and I’ve hardly left my cellar.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'rat', at: 1, gain: 0.8 }],
    act: 'lantern', econ: true, hatch: 0,
    speaker: 'tophat',
    text: 'You’ve solved nothing. There are more rats in this town than last month, and I think I know why.',
    pace: ['brisk', 'even'],
    dur: 2.1,
  },
  {
    econ: true, hatch: 0, peek: true,
    interact: {
      prompt: 'Where are all the new rats coming from?',
      explain: 'Her cellar. She’s breeding rats down there, because every tail she brings in earns a coin. The bakery and the well have nothing to do with it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'creak', at: 1.25, gain: 0.8 }, { id: 'rat', at: 1.6, gain: 0.8 }],
    act: 'farm', econ: true, hatch: 1,
    speaker: 'bun',
    text: 'My rat farm! Two rats make twenty, and twenty make a basket of easy money.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'coin', at: 0.8, gain: 0.7 }],
    act: 'incentive', econ: true, hatch: 1,
    speaker: 'tophat',
    text: 'A reward that changes what people do is called an incentive. People chase the reward, not what you meant by it.',
    pace: ['weighty', 'even'],
    dur: 2.1,
  },
  {
    act: 'supply', econ: true, hatch: 1,
    speaker: 'tophat',
    text: 'You put a price on tails, so the town started making them. It’s supply rising with the price, like any market.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'blame', econ: true, hatch: 1,
    speaker: 'plain',
    text: 'So it’s the rats’ fault, for having so many babies. Clever little things.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 1.95, gain: 0.7 }, { id: 'paper', at: 3.2, gain: 0.7 }],
    act: 'want', econ: true, hatch: 1,
    speaker: 'tophat',
    text: 'No. Pay for what you want, not for something that’s easy to make more of.',
    pace: 'even',
    dur: 2.1,
  },
  {
    econ: true, hatch: 1, decree: true,
    interact: {
      prompt: 'Which of the mayor’s decrees will get rid of the rats?',
      explain: 'A coin per rat-free street. It pays for fewer rats, which is what the town wants. Paying per tail or per rat, at any price, still pays her to breed them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'plank', at: 1.25, gain: 0.7 }],
    act: 'cabbages', econ: true, hatch: 0,
    speaker: 'bun',
    text: 'No rats, no coins? Then I’ll go back to growing cabbages.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', econ: true, hatch: 0,
    quote: {
      id: 'lq-economics-foundations-5-1',
      text: 'Economics is, at root, the study of incentives: how people get what they want, or need, especially when other people want or need the same thing.',
      author: 'Steven Levitt and Stephen Dubner',
      work: 'Freakonomics',
      era: '2005',
      branchSlugs: ['economics'],
    },
    dur: 3.0,
  },
  {
    econ: true, hatch: 0,
    summary: {
      title: 'The Rat-Tail Reward',
      points: [
        'An incentive is a reward that changes what people do',
        'People chase the reward, not what you meant',
        'Reward the result you want, not something easy to fake',
      ],
      closing: 'Next time you see a reward on offer, ask what it makes people do.',
    },
    dur: 2.8,
  },
];
