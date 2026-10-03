import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic business-foundations-3, "How Do You Set a Price?" — the third lesson on the
// Business road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A CRAFT FAIR STALL, HANDMADE CANDLES IN JARS, AND A CHALK PRICE TAG.
//
// Three people talk, and nobody narrates. A candle maker (the newsboy cap), kind to a
// fault, sells his candles for fifty pence; a customer (the woman with the bun) would
// happily pay far more; the adviser (the top hat) shows where a price comes from.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: a price must cover what it costs
// to make · value is what it is worth to the customer · the right price sits between
// the two.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Biz3Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * cheap — the maker sets a candle at the front of the stall and chalks 50p on its tag ·
   * sniff — the customer picks up a candle, sniffs it and holds it to her chest ·
   * arrive — the adviser walks in, tips his hat, opens a hand to the maker, and passes it over the wax and the jars ·
   * cost — he lifts a block of wax and an empty jar off the stall, one in each hand ·
   * dear — the maker covers his mouth with his hand ·
   * value — the adviser gestures from the candle in her hands to her face ·
   * ribbon — the customer pulls a length of ribbon off the spool on the stall and holds it up ·
   * between — the adviser holds one hand low and one high, and brings them together ·
   * tag — the maker wipes the tag and chalks the new price, then ties a ribbon on ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'cheap' | 'sniff' | 'arrive' | 'cost' | 'dear' | 'value' | 'ribbon' | 'between' | 'tag' | 'rest';
  /** The adviser is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The chalk tag: 0 blank · 1 50p · 2 £4. */
  price?: number;
  /** The candle the customer holds: 0 on the stall · 1 in her hands · 2 tied with a ribbon. */
  held?: number;
  /** First question on the stage: the empty jar, her shopping bag and the bunting are the things to tap. */
  costs?: boolean;
  /** Second question on the stage: three price tags, 50p, £4 and £20, are the things to tap. */
  pick?: boolean;
}

export const BEATS: Biz3Beat[] = [
  {
    bed: 'market',
    sfx: [{ id: 'jar', at: 0.84, gain: 0.8 }, { id: 'chalk', at: 1.92, gain: 0.8 }],
    act: 'cheap', price: 1, held: 0,
    speaker: 'cap',
    text: 'Fifty pence a candle! I’d hate for anyone to go without.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'sniff', price: 1, held: 1,
    speaker: 'bun',
    text: 'Fifty pence? I’d happily pay five pounds for a candle that smells like Christmas!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, price: 1, held: 1,
    speaker: 'tophat',
    text: 'Every candle costs him wax, a wick, a jar and an hour of work. A price has to cover all of that.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'jar', at: 5.3, gain: 0.8 }],
    act: 'cost', th: true, price: 1, held: 1,
    speaker: 'tophat',
    text: 'The wax and the jar alone cost two pounds. At fifty pence, every candle he sells makes him poorer.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, price: 1, held: 1, costs: true,
    interact: {
      prompt: 'Which of these is part of what each candle costs him to make?',
      explain: 'The empty jar. He buys one for every candle, so it’s part of the cost. Her shopping bag is hers, and the bunting is only for decoration.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'dear', th: true, price: 1, held: 1,
    speaker: 'cap',
    text: 'Oh dear. I’d only ever thought about the people buying them.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'value', th: true, price: 1, held: 1,
    speaker: 'tophat',
    text: 'Think about them too. Value is what a candle is worth to the customer, and she just told you.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'whoosh', at: 0.79, gain: 0.8 }],
    act: 'ribbon', th: true, price: 1, held: 1,
    speaker: 'bun',
    text: 'Oh, and six pounds if it comes with a ribbon!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'between', th: true, price: 1, held: 1,
    speaker: 'tophat',
    text: 'So the price sits between the two: above what it costs to make, and no higher than people will pay.',
    pace: 'even',
    dur: 2.1,
  },
  {
    th: true, price: 1, held: 1, pick: true,
    interact: {
      prompt: 'What price should go on the candle’s tag?',
      explain: 'Four pounds. It covers the two pounds each candle costs, with some left over, and she would pay more. Fifty pence loses money, and twenty pounds would empty the stall of customers.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'whoosh', at: 1.5, gain: 0.8 }, { id: 'chalk', at: 2.29, gain: 0.8 }],
    act: 'tag', th: true, price: 2, held: 2,
    speaker: 'cap',
    text: 'Four pounds, then. And the ribbon’s on the house, for my first customer.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'rest', th: true, price: 2, held: 2,
    quote: {
      id: 'lq-business-foundations-3-1',
      text: 'Price is what you pay; value is what you get.',
      author: 'Warren Buffett',
      work: 'Letter to Berkshire Hathaway shareholders',
      era: '2008',
      branchSlugs: ['business'],
    },
    dur: 3.0,
  },
  {
    th: true, price: 2, held: 2,
    summary: {
      title: 'How Do You Set a Price?',
      points: [
        'A price must cover what it costs to make',
        'Value is what it’s worth to the customer',
        'The right price sits between the two',
      ],
      closing: 'Next time you see a price, ask what it costs to make, and what it’s worth to you.',
    },
    dur: 2.8,
  },
];
