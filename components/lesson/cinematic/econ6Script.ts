import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic economics-foundations-6, "Too Much Treasure" — the sixth lesson on the
// Economics road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A PIRATE ISLAND, A CHEST OF GOLD ON THE BEACH, AND A COCONUT STALL.
//
// Three people talk, and nobody narrates. A pirate captain (the plain mascot) shares a
// buried treasure with every pirate on the island; the only coconut seller (the woman
// with the bun) watches everyone wave gold at her twelve coconuts; an economist (the top
// hat), marooned on the same beach, explains why a pile of gold made nobody richer.
//
// A ROAD THAT RAMPS UP (group AU): supply and demand set one price; incentives change what
// people do. This lesson is what happens to EVERY price when there's more money and no
// more goods, and it is harder: three ideas — inflation is prices rising across the board
// · more money chasing the same goods pushes prices up · money is worth only what it buys.
// Its first question is a prediction.
//
// Every line is written for the ear (groups AC/AD), from its speaker’s character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17, AP21).
// ─────────────────────────────────────────────────────────────────────────────

export interface Econ6Beat extends BaseBeat {
  /**
   * What happens across this beat’s line (the scene choreographs it):
   * chest — the captain shoves a treasure chest up the sand and flings the lid open; gold spills out ·
   * slate — the seller kneels at her slate, wipes out the price and chalks a higher one ·
   * chasing — the economist, by the palm tree, points from the coconuts to the spilled gold and back ·
   * inflation — the other prices blow off the slate; he picks a gold coin out of the sand, holds it up and turns it over ·
   * hero — the captain plants a boot on the chest, a hand on his knee, chin up ·
   * worth — the economist takes a coconut off the heap and sets his coin on the counter for it ·
   * old — the seller holds up an empty basket, hopeful ·
   * bury — the captain shuts the chest and starts to drag it back down the beach ·
   * rest — everyone at ease under the quotation, the sun going down.
   */
  act?: 'chest' | 'slate' | 'chasing' | 'inflation' | 'hero' | 'worth' | 'old' | 'bury' | 'rest';
  /** The price of a coconut chalked on the slate, in gold coins. */
  price?: number;
  /**
   * First question on the stage — CHALK THE PRICE: three prices chalked side by side on the
   * stall’s slate, 1 COIN, 2 COINS and 4 COINS, are the things to tap. It is a prediction.
   */
  predict?: boolean;
  /**
   * Second question on the stage — LOAD THE SHIP: three crates on the jetty waiting for a
   * ship, COCONUTS AND FISH, MORE GOLD and A BIGGER CANNON, are the things to tap.
   */
  cargo?: boolean;
}

export const BEATS: Econ6Beat[] = [
  {
    bed: 'beach',
    sfx: [{ id: 'crate', at: 2.82, gain: 0.7 }, { id: 'coin', at: 3.68, gain: 0.8 }],
    act: 'chest', price: 1,
    speaker: 'plain',
    text: 'Treasure! I’ve shared it with every pirate on the island. I’m the most generous captain alive.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalk', at: 3.17, gain: 0.8 }],
    act: 'slate', price: 2,
    speaker: 'bun',
    text: 'Everyone’s waving gold at my coconuts, and I’ve only got twelve. So I’ve doubled my price.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'chasing', price: 2,
    speaker: 'tophat',
    text: 'The coconuts didn’t get any better. There’s just more gold chasing the same twelve coconuts.',
    pace: 'even',
    dur: 2.1,
  },
  {
    price: 2, predict: true,
    interact: {
      prompt: 'Next week the island has twice as much gold, and no more coconuts. What will a coconut cost?',
      explain: 'About four coins. With twice the gold and the same coconuts, each coin buys about half as much. Nobody has more coconuts, so the gold is just worth less.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'coinflip', at: 3.08, gain: 0.7 }],
    act: 'inflation', price: 4,
    speaker: 'tophat',
    text: 'When prices rise across the board like that, it’s called inflation. Your gold buys less than it did.',
    pace: ['weighty', 'even'],
    dur: 2.1,
  },
  {
    sfx: [{ id: 'thud', at: 2.91, gain: 0.6 }],
    act: 'hero', price: 4,
    speaker: 'plain',
    text: 'So my treasure made everyone poorer? Impossible. I’m a hero.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'coin', at: 4.21, gain: 0.7 }],
    act: 'worth', price: 4,
    speaker: 'tophat',
    text: 'Not poorer in gold. Poorer in what gold can buy, and money is only worth the things you can get with it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'old', price: 4,
    speaker: 'bun',
    text: 'So how do I get my old prices back? I liked being a one-coin coconut lady.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    price: 4, cargo: true,
    interact: {
      prompt: 'A ship is coming. Which cargo would bring the island’s prices back down?',
      explain: 'Coconuts and fish. More goods for the same gold means each coin buys more again. More gold would push prices higher, and a cannon feeds nobody.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'crate', at: 1.36, gain: 0.7 }],
    act: 'bury', price: 4,
    speaker: 'plain',
    text: 'Then I’m burying the rest of it again, for the good of the economy.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'rest', price: 4,
    quote: {
      id: 'lq-economics-foundations-6-1',
      text: 'Inflation is always and everywhere a monetary phenomenon.',
      author: 'Milton Friedman',
      work: 'Inflation: Causes and Consequences',
      era: '1963',
      branchSlugs: ['economics'],
    },
    dur: 3.0,
  },
  {
    price: 4,
    summary: {
      title: 'Too Much Treasure',
      points: [
        'Inflation is prices rising across the board',
        'More money chasing the same goods pushes prices up',
        'Money is only worth what it can buy',
      ],
      closing: 'Next time prices go up, ask whether things got better or money got cheaper.',
    },
    dur: 2.8,
  },
];
