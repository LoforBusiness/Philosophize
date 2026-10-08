import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic business-foundations-7, "Business Recap: After Closing Time" — the RECAP of
// the Business road's first six lessons (LESSON_RULES group AV), and a DIALOGUE lesson
// (group AP).
// AV: recap
// Theme: AN OLD GENERAL STORE AFTER CLOSING, A BRASS TILL, A LEDGER AND AN ABACUS; THEN A
// COBBLED MARKET STREET AT MORNING, A CHESTNUT CART AND A CHALK SLATE.
//
// Two people talk, and nobody narrates. The accountant (the top hat) is doing the books
// in an old general store after closing: a long wooden counter, a brass cash register
// with a drawer of coins, a fat ledger under a green-shaded lamp, a wooden abacus, a
// spike of receipts, and shelves to the ceiling of tins, jars of sweets, sacks of flour
// and a ladder on a rail; rain-dark windows with the shop's name painted backwards, and
// a bell over the door. The owner from four of these lessons (the plain one: the food
// truck, the balloons, the haunted castle, and the builder at the bakery) walks in sure
// he's a business genius, and opens his next business the next morning: a hot chestnut
// cart on a busy cobbled market street (striped awnings over fruit and fish stalls, shop
// fronts with hanging signs, a clock on a bank, builders on scaffolding across the road,
// the cart with its glowing coal brazier, paper bags and a chalk slate for the price).
// He gets each idea half right and wholly pleased with himself; the accountant sets each
// one straight.
//
// WHAT IT RECAPS, LESSON BY LESSON (each line is taken from what that lesson said):
//   1 What Is a Business? — a queue isn't a business: a business sells what people want
//     for more than it cost to make; a leader gives every job one owner (beats 1–2, 10–12).
//   2 Who Is Your Customer? — your customer is the person whose problem you solve; don't
//     guess, ask the people buying (beats 15–16).
//   3 How Do You Set a Price? — a price must cover what it costs to make, value is what
//     it's worth to the customer, and the price sits between the two (beats 13–17).
//   4 What Is Profit? — revenue is all the money in, costs are paid out to make the
//     sales, profit is what's left: three hundred less two hundred and twenty is eighty
//     (beats 3–5).
//   5 Profit Isn't Cash — profit is on paper and cash is what you hold; money often comes
//     in later than bills go out; take payment early and keep a cash cushion (beats 6–9).
//   6 When Do You Break Even? — fixed costs stay the same however many you sell, variable
//     costs grow with every sale, and break-even is where sales just cover both
//     (beats 19–21).
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14; group AS), and spoken in the natural style (AP22).
// ─────────────────────────────────────────────────────────────────────────────

export interface Biz7Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * work — the accountant alone at the shop counter after closing: runs a pencil down the
   *   ledger, counts coins out of the till drawer, flicks beads on the abacus, spikes a
   *   receipt, sips cold tea ·
   * arrive — the plain one comes in through the shop door (the bell over it swings),
   *   shaking rain off, chin up, and leans on the counter ·
   * business — the accountant shuts the ledger on his pencil and looks at him over it ·
   * boast — the plain one spreads his hands, very sure of himself ·
   * revenue — the accountant pats the cash register, then the spike of receipts ·
   * peek — the plain one leans over and reads the ledger upside down, delighted ·
   * paper — the accountant taps the profit line in the ledger, then holds up the hotel's
   *   note saying it'll pay next month ·
   * tin — the plain one picks an empty biscuit tin off the shelf and shakes it ·
   * staff — the accountant takes the tin from him and sets it on the counter ·
   * apron — the plain one ties on a striped apron and strikes a pose ·
   * jobs — the accountant counts the jobs off on three fingers ·
   * street — morning on the market street: the plain one at his chestnut cart, the coal
   *   glowing, scooping chestnuts into paper bags ·
   * price — the accountant picks up a paper bag and weighs it in his hand ·
   * builders — the plain one points across the road at the builders on the scaffolding ·
   * value — the accountant nods at the builders, then at the blank slate ·
   * sell — the plain one hands a builder a bag and takes the coins ·
   * rent — the accountant points at the rent notice pinned to the cart's side ·
   * bags — the plain one holds up a fresh paper bag in each hand ·
   * even — the accountant chalks a line under a tally of sales on the slate's back ·
   * rest — both by the cart under the quotation, the street busy behind them.
   */
  act?: 'work' | 'arrive' | 'business' | 'boast' | 'revenue' | 'peek' | 'paper' | 'tin' | 'staff' | 'apron' | 'jobs' | 'street' | 'price' | 'builders' | 'value' | 'sell' | 'rent' | 'bags' | 'even' | 'rest';
  /** Where they are: 0 the general store after closing · 1 the market street next morning. */
  place?: number;
  /** What the plain one holds: 0 nothing · 1 the empty biscuit tin · 2 paper bags of chestnuts. */
  holds?: number;
  /**
   * First question on the stage — SLIDE THE ABACUS: the wooden abacus on the counter has
   * three rows of beads pushed across, one row at 300, one at 220 and one at 80; the row
   * that shows the profit is the one to tap.
   */
  abacus?: boolean;
  /**
   * Second question on the stage — EMPTY THE TILL: three things on the counter, the
   * profit line in the open ledger, the hotel's note saying it'll pay next month, and the
   * coins in the cash register's open drawer, are the things to tap.
   */
  till?: boolean;
  /**
   * Third question on the stage — CHALK THE PRICE: three chalk slates leaning on the
   * chestnut cart, reading 20p, £2 and £20; the one that should hang on the cart is the
   * one to tap.
   */
  slate?: boolean;
}

export const BEATS: Biz7Beat[] = [
  {
    bed: 'room',
    sfx: [{ id: 'pencil', at: 1.0, gain: 0.7 }, { id: 'coin', at: 2.4, gain: 0.7 }, { id: 'cashbox', at: 3.6, gain: 0.6 }, { id: 'paper', at: 4.8, gain: 0.6 }, { id: 'pencil', at: 5.6, gain: 0.7 }],
    voiceAfter: 6.2,
    act: 'work', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Every penny in, every penny out. Nearly done.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'arrive', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Tomorrow I start a chestnut cart on the market street. On day one, every chestnut’s free!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'book', at: 0.3, gain: 0.6 }],
    act: 'business', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Then you’ll have a queue, and an empty tin. A business sells what people want for more than it cost to make.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'boast', place: 0, holds: 0,
    speaker: 'plain',
    text: 'I know that. Your shop took three hundred pounds today, so you made three hundred pounds.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'pin', at: 1.4, gain: 0.6 }],
    act: 'revenue', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'That’s the revenue, all the money that came in. The stock, the coal and the rent cost two hundred and twenty of it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, abacus: true,
    interact: {
      prompt: 'Which row of the abacus shows what the shop kept today?',
      explain: 'The row at eighty. Three hundred in, less two hundred and twenty paid out, leaves eighty pounds of profit. The row at three hundred is the revenue, and the row at two hundred and twenty is the costs.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'peek', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Eighty pounds of profit, written right there. So you can lend me some cash for coal tonight.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 1.2, gain: 0.6 }],
    act: 'paper', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Profit in a book isn’t cash in a drawer. Half of it’s owed by the hotel, and they won’t pay until next month.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, holds: 0, till: true,
    interact: {
      prompt: 'The coal man wants paying tonight. Which of these can actually pay him?',
      explain: 'The coins in the till drawer. That’s cash, and it’s here now. The profit line is only on paper, and the hotel’s note won’t turn into money until next month.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'jarlid', at: 0.4, gain: 0.6 }],
    act: 'tin', place: 0, holds: 1,
    speaker: 'plain',
    text: 'So I take the money when people buy, and keep a little cash in a tin. I’ve always said so.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'staff', place: 0, holds: 1,
    speaker: 'tophat',
    text: 'For once, yes. Now, who’s working this cart of yours?',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'apron', place: 0, holds: 0,
    speaker: 'plain',
    text: 'Me, of course. I’ll roast, serve and take the money, like a one-man legend.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'jobs', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Then nobody’s serving while you roast. A leader gives every job one owner, so get someone to serve.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bed: 'street',
    sfx: [{ id: 'paper', at: 1.0, gain: 0.6 }],
    act: 'street', place: 1, holds: 2,
    speaker: 'plain',
    text: 'Each bag costs me fifty pence to make, so I’ll charge twenty. Everybody loves a bargain.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'price', place: 1, holds: 2,
    speaker: 'tophat',
    text: 'Then every bag you sell makes you poorer. A price has to cover what it costs to make.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'builders', place: 1, holds: 2,
    speaker: 'plain',
    text: 'I asked those builders what they want, which was clever of me. They’d pay three pounds a bag for something hot.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'value', place: 1, holds: 2,
    speaker: 'tophat',
    text: 'Asking the people buying was right, for once. Three pounds is the value to them, and your price goes between the cost and that.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, holds: 2, slate: true,
    interact: {
      prompt: 'Which slate should he hang on the chestnut cart?',
      explain: 'The slate saying two pounds. It covers the fifty pence each bag costs, and the builders would pay more. Twenty pence loses money on every bag, and twenty pounds sends them off hungry.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'coin', at: 1.3, gain: 0.7 }],
    act: 'sell', place: 1, holds: 2,
    speaker: 'plain',
    text: 'Two pounds a bag, and that’s my first sale. I’m rich already!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rent', place: 1, holds: 2,
    speaker: 'tophat',
    text: 'Not yet. The cart’s pitch costs sixty pounds a day however many bags you sell, so it’s a fixed cost.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'bags', place: 1, holds: 2,
    speaker: 'plain',
    text: 'And the chestnuts and the bags go up with every sale. So the first bags pay for the pitch?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalk', at: 1.6, gain: 0.6 }],
    act: 'even', place: 1, holds: 2,
    speaker: 'tophat',
    text: 'Each bag leaves one pound fifty, so forty bags cover the sixty pounds. That’s break-even, and every bag after it makes a profit.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'rest', place: 1, holds: 2,
    quote: {
      id: 'lq-business-foundations-7-1',
      text: 'There is only one valid definition of business purpose: to create a customer.',
      author: 'Peter Drucker',
      work: 'The Practice of Management (1954), Chapter 5',
      era: '1954',
      branchSlugs: ['business'],
    },
    dur: 3.0,
  },
  {
    place: 1, holds: 2,
    summary: {
      title: 'Business Recap: After Closing Time',
      points: [
        'Profit is what’s left once the costs come out',
        'Profit on paper isn’t cash you can spend',
        'Price above the cost, and no higher than customers pay',
      ],
      closing: 'Next time you walk past a shop, ask what it keeps, and when the money arrives.',
    },
    dur: 2.8,
  },
];
