import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic business-foundations-4, "What Is Profit?" — the fourth lesson on the
// Business road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A FOOD TRUCK AT CLOSING TIME, A CASH BOX, AND A SPIKE OF RECEIPTS.
//
// Three people talk, and nobody narrates. The van's owner (the plain mascot) counts the
// day's takings and feels rich; his cook (the newsboy cap) did the shopping and holds the
// receipts; the accountant (the top hat) works out what the owner actually keeps.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: revenue is all the money that comes
// in · costs are the money paid out to make the sales · profit is what is left when the
// costs are taken away.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Biz4Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * count — the owner, inside the van, lifts the lid of the cash box, takes the notes out and fans them ·
   * receipts — the cook turns to the spike, pulls three receipts off it and holds them up to the owner ·
   * arrive — the accountant walks in along the pavement with his calculator, sets it down on the
   *   counter, tips his hat and opens a hand to the cash box ·
   * costs — the cook lays the receipts out one by one on the counter beside the box as the
   *   accountant names them, and the accountant opens a hand to them ·
   * keep — the owner leans on the counter, arms folded ·
   * sum — the accountant turns to the van’s little board, takes the chalk off its ledge and chalks
   *   the sum: in, out, and what is left ·
   * shrink — the owner turns to the cash box and shuts it slowly ·
   * bakery — the cook turns and points across the road to the bakery, then turns back ·
   * rest — everyone at ease under the quotation, the van’s lights off.
   */
  act?: 'count' | 'receipts' | 'arrive' | 'costs' | 'keep' | 'sum' | 'shrink' | 'bakery' | 'rest';
  /** The accountant is on the stage. He walks in on `arrive`. */
  sums?: boolean;
  /**
   * The chalk board: 0 blank · 1 the sum written up (in, out, and what is left) · 2 the sum
   * wiped and the second question's three amounts chalked in its place.
   */
  board?: number;
  /** First question on the stage: the cash box, the fuel receipt and the menu board are the things to tap. */
  spend?: boolean;
  /** Second question on the stage: three amounts chalked on the board, eighty, one hundred and three hundred pounds, are the things to tap. */
  left?: boolean;
}

export const BEATS: Biz4Beat[] = [
  {
    act: 'count', board: 0,
    speaker: 'plain',
    text: 'Three hundred pounds today. As I suspected, I’m a business genius.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'receipts', board: 0,
    speaker: 'cap',
    text: 'Brilliant day! Here are the receipts for the bread, the fuel and the pitch.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'arrive', sums: true, board: 0,
    speaker: 'tophat',
    text: 'The three hundred pounds is your revenue: all the money that came in. It isn’t what you keep.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'costs', sums: true, board: 0,
    speaker: 'tophat',
    text: 'Costs are what you paid to make those sales. The bread, the fuel and the pitch came to two hundred and twenty pounds.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sums: true, board: 0, spend: true,
    interact: {
      prompt: 'Which of these is a cost of running the van?',
      explain: 'The fuel receipt. Fuel is money paid out to keep the van going. The cash box holds the money that came in, and the menu just lists what’s for sale.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'keep', sums: true, board: 0,
    speaker: 'plain',
    text: 'Fine. So how much of my genius do I get to keep?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'sum', sums: true, board: 1,
    speaker: 'tophat',
    text: 'Take the costs away from the revenue: three hundred, less two hundred and twenty, leaves eighty pounds. That’s your profit.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'shrink', sums: true, board: 1,
    speaker: 'plain',
    text: 'Eighty pounds. Still a genius, just a slightly smaller one.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'bakery', sums: true, board: 1,
    speaker: 'cap',
    text: 'The bakery across the road sells bread for less. If we buy it there, we’ll keep more.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sums: true, board: 2, left: true,
    interact: {
      prompt: 'The costs fall to two hundred pounds, and the takings stay the same. What is the profit now?',
      explain: 'One hundred pounds. Three hundred in, two hundred out, leaves one hundred. Eighty was the old profit, and three hundred is still the revenue.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'rest', sums: true, board: 2,
    quote: {
      id: 'lq-business-foundations-4-1',
      text: 'Beware of little expenses; a small leak will sink a great ship.',
      author: 'Benjamin Franklin',
      work: 'The Way to Wealth',
      era: '1758',
      branchSlugs: ['business'],
    },
    dur: 3.0,
  },
  {
    sums: true, board: 2,
    summary: {
      title: 'What Is Profit?',
      points: [
        'Revenue is all the money that comes in',
        'Costs are the money paid out to make sales',
        'Profit is what’s left once costs are taken away',
      ],
      closing: 'Next time a shop looks busy, ask how much of the money it gets to keep.',
    },
    dur: 2.8,
  },
];
