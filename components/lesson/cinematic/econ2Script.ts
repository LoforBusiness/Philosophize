import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic economics-foundations-2, "Supply and Demand" — the second lesson on the
// Economics & Finance road, and a DIALOGUE lesson (LESSON_RULES group AP).
// Theme: A STREET CORNER IN THE RAIN, A RACK OF UMBRELLAS, AND A DELIVERY VAN.
//
// Three people talk, and nobody narrates. A street seller (the newsboy cap, who hates
// to overcharge anyone) cannot sell an umbrella all morning, until the sky opens; a
// passer-by (the woman with the bun) would pay anything and says so; the economist (the
// top hat) names the two forces that set every price on the corner.
//
// A FOUNDATION LESSON (AP3), three ideas and no more: demand is how much people want
// to buy at each price · supply is how much sellers offer · the price settles where the
// two meet, and moves when either one does.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14), and read in that speaker's voice at the pace its words ask for
// (AP17): its pauses come from its punctuation.
// ─────────────────────────────────────────────────────────────────────────────

export interface Econ2Beat extends BaseBeat {
  /**
   * What happens across this beat's line (the scene choreographs it):
   * sunny — the seller waves an umbrella at an empty street under a clear sky ·
   * pour — the cloud comes over, the rain starts, and the passer-by runs to the rack and takes five ·
   * arrive — the economist walks in under the awning, tips his hat and shakes off the rain ·
   * demand — he lifts one hand higher and higher as the rain thickens ·
   * raise — the seller wipes the price tag and chalks a bigger number on it ·
   * supply — the economist points at the three umbrellas left on the rack ·
   * van — a delivery van pulls up at the kerb and its side door slides open on a load of umbrellas ·
   * settle — the seller chalks the price down again and hands an umbrella to the economist ·
   * rest — everyone at ease under the quotation.
   */
  act?: 'sunny' | 'pour' | 'arrive' | 'demand' | 'raise' | 'supply' | 'van' | 'settle' | 'rest';
  /** The economist is on the stage. He walks in on `arrive`. */
  th?: boolean;
  /** The weather: 0 sunshine · 1 rain. */
  rain?: number;
  /** The price on the chalk tag: 0 five pounds · 1 twelve pounds · 2 six pounds. */
  tag?: number;
  /** How many umbrellas hang on the rack: she takes five, and the seller hands one to the economist. */
  rack?: number;
  /** The delivery van: 0 away · 1 at the kerb. */
  van?: number;
  /** First question on the stage: the rain cloud, the umbrellas and the price tag are the things to tap. */
  cause?: boolean;
  /** Second question on the stage: the three arrows on the seller’s board are the things to tap. */
  arrow?: boolean;
}

export const BEATS: Econ2Beat[] = [
  {
    act: 'sunny', rain: 0, tag: 0, rack: 8, van: 0,
    speaker: 'cap',
    text: 'Umbrellas, five pounds each, anyone? Well, the sunshine is lovely, at least.',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    act: 'pour', rain: 1, tag: 0, rack: 3, van: 0,
    speaker: 'bun',
    text: 'Oh, it’s pouring! I’ll take one, and so will everybody behind me.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'arrive', th: true, rain: 1, tag: 0, rack: 3, van: 0,
    speaker: 'tophat',
    text: 'The umbrellas haven’t changed, but how many people want one has. Economists call that demand.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'demand', th: true, rain: 1, tag: 0, rack: 3, van: 0,
    speaker: 'tophat',
    text: 'Demand is how much people want to buy, at each price. When the rain starts, it jumps.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    th: true, rain: 1, tag: 0, rack: 3, van: 0, cause: true,
    interact: {
      prompt: 'Nobody wanted an umbrella this morning. What made them worth more this afternoon?',
      explain: 'The rain. The umbrellas are the same ones, and the seller didn’t change them. More people wanting one, at every price, is what pushed their value up.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'raise', th: true, rain: 1, tag: 1, rack: 3, van: 0,
    speaker: 'cap',
    text: 'Three left, and a queue round the corner. I hate to do it, but they’re twelve pounds now.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'supply', th: true, rain: 1, tag: 1, rack: 3, van: 0,
    speaker: 'tophat',
    text: 'That’s the other half: supply, how much sellers have to offer. Few umbrellas and many buyers make a high price.',
    pace: ['even', 'even'],
    dur: 2.1,
  },
  {
    act: 'van', th: true, rain: 1, tag: 1, rack: 3, van: 1,
    speaker: 'bun',
    text: 'Oh, look, a van full of umbrellas has just pulled up! Isn’t that lucky for him?',
    pace: ['brisk', 'even'],
    dur: 1.8,
  },
  {
    th: true, rain: 1, tag: 1, rack: 3, van: 1, arrow: true,
    interact: {
      prompt: 'A van brings a hundred more umbrellas to the corner. Which way does the price go?',
      explain: 'Down. With a hundred more umbrellas on offer, the sellers have to compete for the same buyers. More supply, with the same demand, brings the price down.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'settle', th: true, rain: 1, tag: 2, rack: 2, van: 1,
    speaker: 'cap',
    text: 'Six pounds, then, and everybody stays dry. Fair enough, I say.',
    pace: ['even', 'brisk'],
    dur: 1.8,
  },
  {
    act: 'rest', th: true, rain: 1, tag: 2, rack: 2, van: 1,
    quote: {
      id: 'lq-economics-foundations-2-1',
      text: 'We might as reasonably dispute whether it is the upper or the under blade of a pair of scissors that cuts a piece of paper, as whether value is governed by utility or cost of production.',
      author: 'Alfred Marshall',
      work: 'Principles of Economics',
      era: '1890',
      branchSlugs: ['economics'],
    },
    dur: 3.0,
  },
  {
    th: true, rain: 1, tag: 2, rack: 2, van: 1,
    summary: {
      title: 'Supply and Demand',
      points: [
        'Demand is how much people want to buy, at each price',
        'Supply is how much sellers have to offer',
        'The price moves when either one changes',
      ],
      closing: 'Next time a price jumps, ask what changed: how many people want it, or how much is for sale.',
    },
    dur: 2.8,
  },
];
