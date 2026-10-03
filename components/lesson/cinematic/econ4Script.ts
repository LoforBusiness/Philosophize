import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic economics-foundations-4, "Why Do People Trade?" — the fourth lesson on the
// Economics road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: TWO BACK GARDENS, A LOW FENCE, TOMATO PLANTS AND A HEN HOUSE.
//
// Three people talk, and nobody narrates. A gardener (the woman with the bun) grows
// tomatoes and has just taken up hens, which eat the tomatoes; her neighbour (the
// newsboy cap) keeps hens and has eggs to spare; the economist (the top hat) leans on
// the fence and shows why a swap leaves them both better off.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: specialising means doing one job
// well · trading swaps what you make for what you need · a fair trade leaves both sides
// better off.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Econ4Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * peck — the gardener shoos a hen away from her tomato plants with her hands ·
   * eggs — the neighbour lifts a box of eggs over the fence and holds it out ·
   * arrive — the economist walks in and leans on the fence between the two gardens ·
   * special — he points to her tomato plants, then to the neighbour’s hen house ·
   * swap — the gardener picks tomatoes into a basket and passes it over the fence for the egg box ·
   * gain — the economist chalks the slate on the fence post ·
   * sandwich — the neighbour holds a tomato up to the light, delighted ·
   * hen — the gardener carries her one hen over to the neighbour’s run ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'peck' | 'eggs' | 'arrive' | 'special' | 'swap' | 'gain' | 'sandwich' | 'hen' | 'rest';
  /** The economist is on the stage. He walks in on `arrive`. */
  econ?: boolean;
  /** The swap has happened: 0 not yet · 1 the tomatoes are on his side and the eggs on hers. */
  traded?: number;
  /** First question on the stage: her tomato plants, the hen house and the fence are the things to tap. */
  focus?: boolean;
  /** Second question on the stage: three rows on the slate on the fence post, HER, HIM and BOTH, are the things to tap. */
  gains?: boolean;
}

export const BEATS: Econ4Beat[] = [
  {
    bed: 'garden',
    sfx: [{ id: 'hen', at: 3.64, gain: 0.8 }],
    act: 'peck', traded: 0,
    speaker: 'bun',
    text: 'I’m growing tomatoes and keeping a hen this year. The hen is eating the tomatoes.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'eggs', traded: 0,
    speaker: 'cap',
    text: 'I’ve more eggs than I can eat. Swap you a box for a few tomatoes?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', econ: true, traded: 0,
    speaker: 'tophat',
    text: 'That swap is the whole idea of trade. Each of you makes what you’re good at, then you exchange.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'special', econ: true, traded: 0,
    speaker: 'tophat',
    text: 'Doing one job well is called specialising. She grows tomatoes, he keeps hens, and nobody does both badly.',
    pace: 'even',
    dur: 2.1,
  },
  {
    econ: true, traded: 0, focus: true,
    interact: {
      prompt: 'What should she use her garden for?',
      explain: 'The tomato plants. She grows them well, and the hen kept eating them. Her neighbour already keeps hens, so she can get eggs by trading.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'hen', at: 3, gain: 0.8 }],
    act: 'swap', econ: true, traded: 1,
    speaker: 'bun',
    text: 'So I give him tomatoes, and he gives me eggs. And I don’t have to talk to the hen.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalk', at: 0.64, gain: 0.8 }, { id: 'chalk', at: 2.14, gain: 0.8 }],
    act: 'gain', econ: true, traded: 1,
    speaker: 'tophat',
    text: 'You both end up with more than you’d make doing everything yourselves. Trade isn’t one side winning.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'sandwich', econ: true, traded: 1,
    speaker: 'cap',
    text: 'Fresh tomatoes for my sandwiches. I couldn’t grow one of these if I tried.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    econ: true, traded: 1, gains: true,
    interact: {
      prompt: 'Who gains from the swap over the fence?',
      explain: 'Both of them. She gets eggs without a hen eating her crop, and he gets tomatoes without growing them. A fair trade leaves each side better off.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'hen', at: 0.8, gain: 0.8 }],
    act: 'hen', econ: true, traded: 1,
    speaker: 'bun',
    text: 'Then my hen should live with his hens. She’ll be much happier there, I think.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'rest', econ: true, traded: 1,
    quote: {
      id: 'lq-economics-foundations-4-1',
      text: 'The tailor does not attempt to make his own shoes, but buys them of the shoemaker.',
      author: 'Adam Smith',
      work: 'The Wealth of Nations',
      era: '1776',
      branchSlugs: ['economics'],
    },
    dur: 3.0,
  },
  {
    econ: true, traded: 1,
    summary: {
      title: 'Why Do People Trade?',
      points: [
        'Specialising means doing one job well',
        'Trading swaps what you make for what you need',
        'A fair trade leaves both sides better off',
      ],
      closing: 'Next time you buy a loaf, ask how long baking your own would take.',
    },
    dur: 2.8,
  },
];
